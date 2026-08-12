import {
  afterRenderEffect,
  computed,
  contentChild,
  Directive,
  DOCUMENT,
  ElementRef,
  inject,
  input,
  InputSignal,
  InputSignalWithTransform,
  linkedSignal,
  Signal,
  TemplateRef,
  viewChild,
  WritableSignal,
} from '@angular/core';
import { VirtualScroll } from '../../features/virtual-scroll';
import { createOverlayManager } from '../overlay';
import { selectTemplateContext } from './abstract-select.types';
import { normalizeOptions, Option, optionInput } from './options';
import { ValueFormControl } from './value-form-control';
import { controlSize } from '../../types';

/**
 * Shared base for the single {@link Select} and {@link MultiSelect} controls.
 * Owns everything the two listbox-combobox controls have in common: the option
 * inputs, the connected overlay lifecycle, roving `aria-activedescendant`
 * navigation, and the keyboard handler. The per-control differences (the value
 * shape, the selected-state check, how the trigger label is built and what a
 * commit does) are expressed through the abstract members below.
 */
@Directive()
export abstract class AbstractSelect<T, V, ValueType> extends ValueFormControl<ValueType> {
  protected readonly overlay = createOverlayManager();

  private readonly _document: Document = inject(DOCUMENT);

  private readonly triggerElement = viewChild<ElementRef<HTMLElement>>('trigger');
  private readonly panelTemplate = viewChild<TemplateRef<void>>('panel');
  private readonly virtualScrollRef = viewChild(VirtualScroll);

  /**
   * Whether the panel has already been rendered open, distinguishing the render that
   * opens it from the ones that follow while it stays open.
   */
  private _panelWasOpen = false;

  /**
   * Keeps the active option visible inside the scrolling panel. Focus stays on the
   * trigger and only `aria-activedescendant` moves, so the browser never scrolls the
   * option list on its own — every write of `activeIndex` (keyboard navigation, the
   * initial index on open, a filter narrowing the list) has to be followed by an
   * explicit scroll. Running after render guarantees the option's element exists even
   * when the same change re-rendered the list. `nearest` leaves an already-visible
   * option where it is, so pointer-driven activation never causes a scroll.
   */
  private readonly _scrollActiveOptionIntoView = afterRenderEffect(() => {
    const isOpen = this.isOpen();
    const wasOpen = this._panelWasOpen;
    this._panelWasOpen = isOpen;
    if (!isOpen) return;

    const virtualScroll = this.virtualScrollRef();
    // The overlay pane is attached (and re-attached — it is reused across opens)
    // after the panel's view is created, so the viewport's cached measurement is
    // stale until it is re-measured in the first render of an open panel.
    if (virtualScroll && !wasOpen) virtualScroll.checkViewportSize();

    const index = this.activeIndex();
    if (index < 0) return;
    // The option elements are re-created when the visible list changes, so the scroll
    // has to re-run then too, not only when the index moves.
    this.visibleOptions();

    if (virtualScroll) {
      // `aria-activedescendant` may only reference a rendered element; scrolling the
      // index into view keeps it inside the rendered window, and the viewport's render
      // buffers cover the moment between the index moving and the window following.
      virtualScroll.scrollIndexIntoView(index);
      return;
    }

    const option = this._document.getElementById(this.optionId(index));
    if (option) option.scrollIntoView({ block: 'nearest' });
  });

  /**
   * Consumer template rendered inside each option button in place of the plain
   * label (`<ng-template #option let-context>`). The button itself — and with it
   * the option's ARIA, activation, and hover behavior — stays owned by the
   * control; the template only customizes the visual content.
   */
  protected readonly optionTemplate =
    contentChild<TemplateRef<selectTemplateContext<T, V>>>('option');

  // Shared inputs (config-independent)
  public readonly options: InputSignal<optionInput<T>[]> = input<optionInput<T>[]>([]);
  public readonly optionLabel = input<keyof T | undefined>(undefined);
  public readonly optionValue = input<keyof T | undefined>(undefined);
  public readonly optionDisabled = input<keyof T | undefined>(undefined);
  public readonly tabindex = input<string | number>(0);

  // Config-defaulted inputs are declared by each concrete control.
  public abstract readonly placeholder: InputSignal<string>;
  public abstract readonly size: InputSignal<controlSize>;
  public abstract readonly fluid: InputSignalWithTransform<boolean, unknown>;
  public abstract readonly clearable: InputSignalWithTransform<boolean, unknown>;
  /** Renders the panel through a virtual-scroll viewport, windowing the option list. */
  public abstract readonly virtualScroll: InputSignalWithTransform<boolean, unknown>;
  /** Fixed height of an option row, in pixels, when the panel is virtualized. */
  public abstract readonly virtualScrollItemSize: InputSignalWithTransform<number, unknown>;

  protected readonly isOpen: Signal<boolean> = this.overlay.isOpen;

  protected readonly normalizedOptions: Signal<Option<V>[]> = computed(() =>
    normalizeOptions<T, V>(this.options(), {
      label: this.optionLabel(),
      value: this.optionValue(),
      disabled: this.optionDisabled(),
    }),
  );

  /**
   * Options actually shown in the panel and traversed by keyboard navigation. Defaults to the full
   * normalized list; a filtering control (an editable combobox) narrows it via
   * {@link filterVisibleOptions}. `activeIndex` always indexes into this list, never the raw one.
   */
  protected readonly visibleOptions: Signal<Option<V>[]> = computed(() =>
    this.filterVisibleOptions(this.normalizedOptions()),
  );

  /**
   * Index of the option keyboard navigation rests on, within `visibleOptions`; −1
   * means none. When the visible list changes under it (the options swapped while the
   * panel is open), an index that fell out of range snaps to the last enabled option,
   * so `aria-activedescendant` never references an element that no longer exists.
   */
  protected readonly activeIndex: WritableSignal<number> = linkedSignal<Option<V>[], number>({
    source: this.visibleOptions,
    computation: (options, previous) => {
      if (previous === undefined) return -1;
      if (previous.value < options.length) return previous.value;

      for (let index = options.length - 1; index >= 0; index--) {
        if (!options[index].disabled) return index;
      }
      return -1;
    },
  });

  protected readonly activeDescendantId: Signal<string | null> = computed(() => {
    const index = this.activeIndex();
    if (index < 0) return null;
    return this.optionId(index);
  });

  /**
   * Height of the virtualized option viewport: sized to the options, capped so the
   * panel — viewport plus its block padding — never exceeds the panel's max-height.
   * A short list therefore produces a short panel instead of an empty scroll area.
   * Bound to the viewport's `--tls-virtual-scroll-height` custom property.
   */
  protected readonly virtualPanelHeight: Signal<string> = computed(() => {
    const prefix = this.panelCssVariablePrefix;
    const contentHeight = this.visibleOptions().length * this.virtualScrollItemSize();
    return `min(${contentHeight}px, calc(var(${prefix}-max-height) - 2 * var(${prefix}-padding-block)))`;
  });

  protected readonly hostClasses: Signal<string[]> = computed(() => {
    const array: string[] = [this.hostClassBase];

    if (this.isOpen()) array.push(`${this.hostClassBase}--open`);
    array.push(`${this.CLASS_NAME}--${this.size()}`);
    if (this.fluid()) array.push(`${this.CLASS_NAME}--fluid`);

    return array.concat(this.hostStateClasses(), this.controlClasses());
  });

  protected get listboxId(): string {
    return `${this.uniqueId}-listbox`;
  }

  // Per-control hooks
  protected abstract readonly uniqueId: string;
  protected abstract readonly hostClassBase: string;
  protected abstract readonly panelClass: string;
  /**
   * Prefix of the control's panel custom properties; `<prefix>-max-height` and
   * `<prefix>-padding-block` must exist under it, as they size the virtualized viewport.
   */
  protected abstract readonly panelCssVariablePrefix: string;
  protected abstract readonly hasValue: Signal<boolean>;
  /** Whether `option` is part of the current selection (scalar or array, per control). */
  protected abstract isOptionSelected(option: Option<V>): boolean;
  /** Index the active option starts on when the panel opens. */
  protected abstract getInitialActiveIndex(): number;
  /** Apply the active option's selection when committed via mouse or keyboard. */
  protected abstract commitActiveOption(option: Option<V>): void;
  /** Reset the control to its empty value. */
  protected abstract clear(): void;

  /**
   * Host modifiers for states only one control has, listed alongside the shared ones. Read from
   * within the host-class computation, so signals a control reads here stay reactive.
   */
  protected hostStateClasses(): string[] {
    return [];
  }

  /**
   * Narrows the option list shown in the panel. The listbox controls show every option; an editable
   * combobox overrides this to filter by the typed query.
   */
  protected filterVisibleOptions(options: Option<V>[]): Option<V>[] {
    return options;
  }

  /** Hook invoked after the panel has closed, once the trigger has regained focus. */
  protected onClosed(): void {
    // No-op by default; an editable combobox overrides this to reconcile its text.
  }

  // Protected methods
  protected open(): void {
    const triggerElement = this.triggerElement();
    const panelTemplate = this.panelTemplate();
    if (this.notInteractive() || this.isOpen() || !triggerElement || !panelTemplate) return;

    this.overlay.open({
      content: panelTemplate,
      origin: triggerElement,
      positions: [
        { originX: 'start', originY: 'bottom', overlayX: 'start', overlayY: 'top', offsetY: 4 },
        { originX: 'start', originY: 'top', overlayX: 'start', overlayY: 'bottom', offsetY: -4 },
      ],
      flexibleDimensions: false,
      push: false,
      panelClass: this.panelClass,
      // The control handles Escape itself via the trigger's keydown handler.
      closeOnEscape: false,
      minWidth: triggerElement.nativeElement.offsetWidth,
      reuse: true,
      onClose: () => {
        this.activeIndex.set(-1);
        const trigger = this.triggerElement();
        if (trigger) trigger.nativeElement.focus();
        this.onClosed();
      },
    });

    this.activeIndex.set(this.getInitialActiveIndex());
  }

  protected close(): void {
    this.overlay.close();
  }

  protected toggle(): void {
    if (this.isOpen()) {
      this.close();
    } else {
      this.open();
    }
  }

  protected onOptionHover(event: PointerEvent, index: number, disabled?: boolean): void {
    // A touch "enter" is a tap in progress, not a hover; the click that follows
    // commits the option, so the active index has nothing to track.
    if (event.pointerType === 'touch') return;
    if (!disabled) this.activeIndex.set(index);
  }

  protected onKeydown(event: KeyboardEvent): void {
    if (event.key === 'ArrowDown') {
      event.preventDefault();
      if (this.isOpen()) {
        this.moveActive(1);
      } else {
        this.open();
      }
    } else if (event.key === 'ArrowUp') {
      event.preventDefault();
      if (this.isOpen()) {
        this.moveActive(-1);
      } else {
        this.open();
      }
    } else if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      if (!this.isOpen()) {
        this.open();
        return;
      }
      const active = this.visibleOptions()[this.activeIndex()];
      if (active && !active.disabled) this.commitActiveOption(active);
    } else if (event.key === 'Home') {
      if (!this.isOpen()) return;
      event.preventDefault();
      this.moveActiveToEdge(1);
    } else if (event.key === 'End') {
      if (!this.isOpen()) return;
      event.preventDefault();
      this.moveActiveToEdge(-1);
    } else if (event.key === 'Escape') {
      event.preventDefault();
      if (this.isOpen()) this.close();
    } else if (event.key === 'Tab') {
      if (this.isOpen()) this.close();
    } else if (
      (event.key === 'Delete' || event.key === 'Backspace') &&
      this.clearable() &&
      this.hasValue()
    ) {
      event.preventDefault();
      this.clear();
    }
  }

  protected optionId(index: number): string {
    return `${this.uniqueId}-option-${index}`;
  }

  /** Context handed to the consumer's option template for the option at `index`. */
  protected optionContext(option: Option<V>, index: number): selectTemplateContext<T, V> {
    return {
      $implicit: {
        option: option.source as T,
        value: option.value,
        label: option.label,
        index,
        selected: this.isOptionSelected(option),
        active: index === this.activeIndex(),
        disabled: option.disabled,
      },
    };
  }

  protected moveActive(direction: 1 | -1): void {
    const options = this.visibleOptions();
    let next = this.activeIndex() + direction;

    while (next >= 0 && next < options.length) {
      if (!options[next].disabled) {
        this.activeIndex.set(next);
        return;
      }
      next += direction;
    }
  }

  // Private methods
  private moveActiveToEdge(direction: 1 | -1): void {
    const options = this.visibleOptions();
    let next = direction === 1 ? 0 : options.length - 1;

    while (next >= 0 && next < options.length) {
      if (!options[next].disabled) {
        this.activeIndex.set(next);
        return;
      }
      next += direction;
    }
  }
}

