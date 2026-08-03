import {
  afterNextRender,
  booleanAttribute,
  Component,
  computed,
  effect,
  ElementRef,
  forwardRef,
  inject,
  input,
  InputSignal,
  InputSignalWithTransform,
  model,
  ModelSignal,
  OnDestroy,
  signal,
  Signal,
  viewChild,
  WritableSignal,
} from '@angular/core';
import { Toolbar, ToolbarWidget } from '@angular/aria/toolbar';
import { toggleMark } from 'prosemirror-commands';
import { EditorState } from 'prosemirror-state';
import { EditorView } from 'prosemirror-view';
import { controlSize, FORM_CONTROL, Icon, ValueFormControl } from '@thalassic/ui';
import { RichTextEditorLabels } from './rich-text-editor.config';
import { LINK_SCHEME_REGEX, SAFE_LINK_SCHEMES } from './rich-text-editor.constants';
import { markdownParser, markdownSerializer } from './rich-text-editor.markdown';
import { buildRichTextPlugins } from './rich-text-editor.plugins';
import { richTextSchema } from './rich-text-editor.schema';
import { RICH_TEXT_EDITOR_CONFIG } from './rich-text-editor.token';
import { buildToolbarButtons } from './rich-text-editor.toolbar';
import {
  RichTextResolvedEntry,
  RichTextToolbarButton,
  richTextToolbarEntry,
} from './rich-text-editor.types';

/**
 * A WYSIWYG rich-text form control whose value is a Markdown string. The editable surface is
 * powered by ProseMirror against a Markdown-capable schema, so content round-trips losslessly
 * to Markdown while the user edits formatted text directly.
 */
@Component({
  selector: 'tls-rich-text-editor',
  templateUrl: './rich-text-editor.html',
  styleUrl: './rich-text-editor.scss',
  imports: [Icon, Toolbar, ToolbarWidget],
  // The accessible name lives on the inner `role="textbox"` (see `_contentAttributes`)
  // where focus lands; the group host reflects only validation state, so screen
  // readers never announce the name twice.
  host: {
    role: 'group',
    '[class]': 'classes()',
    '[style.--tls-rich-text-editor-min-rows]': 'minRows()',
    '[attr.aria-invalid]': "invalid() ? 'true' : null",
  },
  providers: [{ provide: FORM_CONTROL, useExisting: forwardRef(() => RichTextEditor) }],
})
export class RichTextEditor extends ValueFormControl<string> implements OnDestroy {
  // Injections
  private readonly _config = inject(RICH_TEXT_EDITOR_CONFIG);

  // Inputs
  public readonly value: ModelSignal<string> = model<string>('');
  public readonly placeholder: InputSignal<string> = input<string>(this._config.placeholder);
  public readonly size: InputSignal<controlSize> = input<controlSize>(this._config.size);
  public readonly fluid: InputSignalWithTransform<boolean, unknown> = input<boolean, unknown>(
    this._config.fluid,
    { transform: booleanAttribute },
  );
  public readonly toolbar: InputSignal<richTextToolbarEntry[]> = input<richTextToolbarEntry[]>(
    this._config.toolbar,
  );
  public readonly minRows: InputSignal<number> = input<number>(this._config.minRows);

  // State
  private readonly _editorHost = viewChild.required<ElementRef<HTMLElement>>('editorHost');
  private readonly _linkInput = viewChild<ElementRef<HTMLInputElement>>('linkInput');
  private readonly _editorState: WritableSignal<EditorState | null> = signal<EditorState | null>(
    null,
  );
  protected readonly linkEditing: WritableSignal<boolean> = signal<boolean>(false);
  protected readonly linkUrl: WritableSignal<string> = signal<string>('');

  protected readonly labels: RichTextEditorLabels = this._config.labels;

  // The toolbar-control map, resolved once against the schema.
  private readonly _buttons: Record<string, RichTextToolbarButton> = buildToolbarButtons(
    richTextSchema,
    this._config.labels,
  );

  private _view: EditorView | null = null;
  // The most recent Markdown this component emitted, used to ignore its own value writes.
  private _lastEmitted = '';

  // Computed
  protected readonly classes: Signal<string[]> = computed<string[]>(() => {
    const array: string[] = ['tls-rich-text-editor'];

    // Size/fluid ride the shared form-control classes (like every text control),
    // so the theme's size tokens apply without a duplicated per-component table.
    array.push(`${this.CLASS_NAME}--${this.size()}`);
    if (this.fluid()) array.push(`${this.CLASS_NAME}--fluid`);

    return array.concat(this.controlClasses());
  });

  // The toolbar layout resolved to renderable entries (separators and controls).
  protected readonly entries: Signal<RichTextResolvedEntry[]> = computed<RichTextResolvedEntry[]>(
    () =>
      this.toolbar().map(entry => {
        if (entry === 'separator') return { separator: true, button: null };

        return { separator: false, button: this._buttons[entry] };
      }),
  );

  // ARIA/state attributes forwarded onto the contenteditable textbox managed by ProseMirror.
  private readonly _contentAttributes: Signal<Record<string, string>> = computed<
    Record<string, string>
  >(() => {
    const attributes: Record<string, string> = {
      class: 'tls-rich-text-editor__content',
      role: 'textbox',
      'aria-multiline': 'true',
      translate: 'no',
    };

    const label = this.ariaLabel();
    if (label) attributes['aria-label'] = label;

    const labelledby = this.labelledBy();
    if (labelledby) attributes['aria-labelledby'] = labelledby;

    const describedby = this.describedBy();
    if (describedby) attributes['aria-describedby'] = describedby;

    if (this.invalid()) attributes['aria-invalid'] = 'true';
    if (this.required()) attributes['aria-required'] = 'true';
    if (this.pending()) attributes['aria-busy'] = 'true';
    if (this.readonly()) attributes['aria-readonly'] = 'true';

    const placeholder = this.placeholder();
    if (placeholder) {
      attributes['data-placeholder'] = placeholder;
      if (this._isDocumentEmpty()) attributes['data-empty'] = 'true';
    }

    return attributes;
  });

  constructor() {
    super();

    // Reflect external value writes back into the document, skipping the component's own emits
    // and no-op writes so typing never rebuilds the document under the cursor.
    effect(() => {
      const markdown = this.value();
      const view = this._view;
      if (!view) return;
      if (markdown === this._lastEmitted) return;
      if (markdown === markdownSerializer.serialize(view.state.doc)) {
        this._lastEmitted = markdown;
        return;
      }

      // Replace the document through a transaction on the live state rather than a
      // rebuilt EditorState, so plugin state — notably the undo history — survives
      // the external write (and the write itself becomes undoable).
      const parsed = markdownParser.parse(markdown);
      const transaction = view.state.tr.replaceWith(0, view.state.doc.content.size, parsed.content);
      view.dispatch(transaction);
      this._lastEmitted = markdown;
    });

    // Keep the editable state and forwarded ARIA attributes in sync with the control's inputs.
    effect(() => {
      const editable = !this.notInteractive();
      const attributes = this._contentAttributes();
      const view = this._view;
      if (!view) return;

      view.setProps({ editable: () => editable, attributes: () => attributes });
    });

    // Move focus into the URL input when the link editor opens, so the ⌘K/toolbar flow
    // continues on the keyboard without tabbing.
    effect(() => {
      const linkInput = this._linkInput();
      if (this.linkEditing() && linkInput) linkInput.nativeElement.focus();
    });

    afterNextRender(() => this._createView());
  }

  // Protected methods
  protected isActive(button: RichTextToolbarButton): boolean {
    const state = this._editorState();
    if (!state) return false;
    return button.isActive(state);
  }

  protected runCommand(button: RichTextToolbarButton): void {
    const view = this._view;
    if (!view) return;

    if (button.id === 'link') {
      this._toggleLink();
      return;
    }

    button.command(view.state, view.dispatch, view);
  }

  /**
   * Returns focus to the editable surface after a pointer-driven toolbar click.
   *
   * Bound on the toolbar container rather than the controls themselves: the roving-tabindex
   * behavior focuses the clicked control from that control's own `click` handler, so only a
   * listener further up the bubble path is guaranteed to run afterwards. Restoring focus
   * there keeps it inside the same event dispatch, so no frame ever paints with focus — and
   * its ring — on the button.
   *
   * Keyboard-activated clicks report an empty `pointerType` and are left alone: there the
   * toolbar is the user's position in the widget and must keep both focus and its ring.
   */
  protected restoreEditorFocus(event: MouseEvent): void {
    if (!(event instanceof PointerEvent)) return;
    if (event.pointerType === '') return;
    // The URL editor legitimately owns focus once it opens.
    if (this.linkEditing()) return;

    const view = this._view;
    if (view) view.focus();
  }

  protected applyLink(event?: Event): void {
    // Enter must not bubble into an enclosing <form> submit or other default handling.
    if (event) event.preventDefault();

    const view = this._view;
    const href = this.linkUrl().trim();
    this.linkEditing.set(false);
    if (!view) return;
    if (!href || !this._isSafeHref(href)) {
      view.focus();
      return;
    }

    toggleMark(richTextSchema.marks['link'], { href })(view.state, view.dispatch);
    view.focus();
  }

  protected cancelLink(event?: Event): void {
    // Escape must not also close an enclosing dialog or clear other default behavior.
    if (event) event.preventDefault();

    const view = this._view;
    this.linkEditing.set(false);
    if (view) view.focus();
  }

  protected onLinkInput(event: Event): void {
    const target = event.target as HTMLInputElement;

    this.linkUrl.set(target.value);
  }

  // Private methods
  private _createView(): void {
    const host = this._editorHost();

    const state = EditorState.create({
      schema: richTextSchema,
      doc: markdownParser.parse(this.value()),
      plugins: buildRichTextPlugins(richTextSchema, {
        toggleLink: () => {
          this._toggleLink();
          return true;
        },
      }),
    });

    const view = new EditorView(host.nativeElement, {
      state,
      editable: () => !this.notInteractive(),
      attributes: () => this._contentAttributes(),
      handleDOMEvents: {
        blur: () => {
          this.touched.set(true);
          return false;
        },
      },
      dispatchTransaction: transaction => {
        const newState = view.state.apply(transaction);
        view.updateState(newState);
        this._editorState.set(newState);

        if (transaction.docChanged) {
          const markdown = markdownSerializer.serialize(newState.doc);
          this._lastEmitted = markdown;
          this.value.set(markdown);
        }
      },
    });

    this._view = view;
    this._editorState.set(state);
    // Seed with the Markdown the document was built from, so the value-sync effect's
    // "own emit" guard starts aligned with the actual content — otherwise the first
    // external write that happens to equal the seed default is silently dropped.
    this._lastEmitted = this.value();
  }

  /**
   * Whether an href is safe to store as a link: scheme-less (relative, `#anchor`) or
   * carrying an allow-listed scheme. Rejects `javascript:`/`data:`-style URLs so a
   * crafted link cannot smuggle an executable payload into the emitted Markdown.
   */
  private _isSafeHref(href: string): boolean {
    const scheme = LINK_SCHEME_REGEX.exec(href);
    if (!scheme) return true;
    return SAFE_LINK_SCHEMES.includes(scheme[0].toLowerCase());
  }

  // Whether the document holds no content (a single empty top-level block), so the
  // placeholder should show. ProseMirror keeps a trailing `<br>` in empty textblocks,
  // which defeats a CSS `:empty` check, so emptiness is derived from the document model.
  private _isDocumentEmpty(): boolean {
    const state = this._editorState();
    if (!state) return true;

    const { doc } = state;
    if (doc.childCount > 1) return false;

    const firstChild = doc.firstChild;
    return firstChild === null || firstChild.content.size === 0;
  }

  // Removes the link on the current selection, or opens the link editor to add one.
  private _toggleLink(): void {
    const view = this._view;
    if (!view) return;

    if (this._buttons['link'].isActive(view.state)) {
      this._buttons['link'].command(view.state, view.dispatch, view);
      view.focus();
      return;
    }

    if (view.state.selection.empty) {
      view.focus();
      return;
    }

    this.linkUrl.set('');
    this.linkEditing.set(true);
  }

  // Lifecycle
  public ngOnDestroy(): void {
    const view = this._view;
    if (!view) return;

    // Cleared so a deferred focus restore that outlives the component is a no-op
    // rather than a call into a destroyed view.
    this._view = null;
    view.destroy();
  }
}
