import {
  booleanAttribute,
  Component,
  computed,
  forwardRef,
  inject,
  input,
  InputSignal,
  InputSignalWithTransform,
  linkedSignal,
  model,
  ModelSignal,
  numberAttribute,
  output,
  OutputEmitterRef,
  Signal,
  WritableSignal,
} from '@angular/core';
import { NgTemplateOutlet } from '@angular/common';
import { AbstractSelect, FORM_CONTROL, Option } from '../../../abstract/form';
import { controlSize } from '../../../types';
import { Icon } from '../../icon';
import { Loader } from '../../loader';
import { VirtualScroll } from '../../virtual-scroll';
import { autocompleteFilterMode } from './autocomplete-filter-mode';
import { AUTOCOMPLETE_CONFIG } from './autocomplete.token';

@Component({
  selector: 'tls-autocomplete',
  templateUrl: './autocomplete.html',
  imports: [Loader, Icon, NgTemplateOutlet, VirtualScroll],
  host: {
    '[class]': 'hostClasses()',
  },
  providers: [{ provide: FORM_CONTROL, useExisting: forwardRef(() => Autocomplete) }],
})
export class Autocomplete<T, V = unknown> extends AbstractSelect<T, V, V | null> {
  private static _nextUniqueId = 0;

  private readonly _config = inject(AUTOCOMPLETE_CONFIG);

  override readonly supportsLabelFor = true;

  protected readonly uniqueId = `tls-autocomplete-${Autocomplete._nextUniqueId++}`;
  protected readonly hostClassBase = 'tls-autocomplete';
  protected readonly panelClass = 'tls-autocomplete-panel';
  protected readonly panelCssVariablePrefix = '--tls-autocomplete-panel';

  public readonly value: ModelSignal<V | null> = model<V | null>(null);
  public readonly placeholder = input<string>(this._config.placeholder);
  public readonly size: InputSignal<controlSize> = input<controlSize>(this._config.size);
  public readonly fluid: InputSignalWithTransform<boolean, unknown> = input<boolean, unknown>(
    this._config.fluid,
    { transform: booleanAttribute },
  );
  public readonly clearable: InputSignalWithTransform<boolean, unknown> = input<boolean, unknown>(
    this._config.clearable,
    { transform: booleanAttribute },
  );
  /**
   * How the typed query narrows the options. `none` hands that job over entirely — the list is
   * shown as given, which is what a list fetched per query needs.
   */
  public readonly filterMode = input<autocompleteFilterMode>(this._config.filterMode);
  /**
   * Whether a search is in flight. While raised the panel reports the loading state in place of
   * the empty message, so a list that has not arrived yet stops reading like one that came back
   * with nothing.
   */
  public readonly loading: InputSignalWithTransform<boolean, unknown> = input<boolean, unknown>(
    false,
    { transform: booleanAttribute },
  );
  /**
   * Characters the query must reach before it is emitted and before the panel shows options or
   * the empty message, so an empty field never asks for the whole collection. `0` places no
   * floor on it.
   */
  public readonly minQueryLength: InputSignalWithTransform<number, unknown> = input<
    number,
    unknown
  >(this._config.minQueryLength, { transform: numberAttribute });
  public readonly emptyMessage = input<string>(this._config.emptyMessage);
  public readonly loadingMessage = input<string>(this._config.loadingMessage);
  public readonly clearLabel = input<string>(this._config.clearLabel);
  public readonly virtualScroll: InputSignalWithTransform<boolean, unknown> = input<
    boolean,
    unknown
  >(this._config.virtualScroll, { transform: booleanAttribute });
  public readonly virtualScrollItemSize: InputSignalWithTransform<number, unknown> = input<
    number,
    unknown
  >(this._config.virtualScrollItemSize, { transform: numberAttribute });

  /**
   * The field's text, emitted as it is typed — the hook for answering a query from a source the
   * control does not hold. Only typing emits: committing a selection, clearing, and closing the
   * panel all rewrite the text too, and none of them is a search anyone asked for. Nothing is
   * emitted while the text is shorter than {@link minQueryLength}. Any debouncing belongs to the
   * listener.
   */
  public readonly queryChange: OutputEmitterRef<string> = output<string>();

  protected readonly hasValue: Signal<boolean> = computed(() => {
    const value = this.value();
    return value !== null && value !== undefined;
  });

  protected readonly selectedLabel: Signal<string> = computed(() => {
    if (!this.hasValue()) return '';
    const selected = this.normalizedOptions().find(option => option.value === this.value());
    if (!selected) return '';
    return selected.label;
  });

  /**
   * The text shown in the field: the committed selection's label by default, overwritten with a
   * free-text query as the user types. Re-derives from the label whenever the committed value
   * changes (a selection, a clear, or an external model update), so the field always reflects it.
   */
  protected readonly query: WritableSignal<string> = linkedSignal(() => this.selectedLabel());

  /** Whether the query has yet to reach the length below which the control stays silent. */
  protected readonly belowMinQueryLength: Signal<boolean> = computed(() => {
    // The label a committed selection puts in the field is not a query, however short it is,
    // so browsing an existing selection is never held to the floor a search has to clear.
    if (this.hasValue() && this.query() === this.selectedLabel()) return false;
    return this.query().trim().length < this.minQueryLength();
  });

  /**
   * Whether the panel has anything to put in its box: options, the loading state, or the empty
   * message. A query under {@link minQueryLength} produces none of the three, and an empty box is
   * worse than no box at all.
   */
  protected readonly hasPanelContent: Signal<boolean> = computed(() => {
    if (this.loading()) return true;
    if (this.visibleOptions().length > 0) return true;
    return !this.belowMinQueryLength();
  });

  /** Whether work is outstanding on the control: async validation, or a search in flight. */
  protected readonly busy: Signal<boolean> = computed(() => this.pending() || this.loading());

  protected select(option: Option<V>): void {
    if (option.disabled) return;
    this.value.set(option.value);
    this.close();
  }

  protected isOptionSelected(option: Option<V>): boolean {
    return option.value === this.value();
  }

  protected onInput(event: Event): void {
    const target = event.target as HTMLInputElement;
    this.query.set(target.value);
    this.open();
    this.activeIndex.set(this.getInitialActiveIndex());
    // Typing is the only thing that emits; every other write of `query` re-derives it from the
    // committed selection, and a listener must not be sent a query nobody typed.
    if (!this.belowMinQueryLength()) this.queryChange.emit(target.value);
  }

  protected override onKeydown(event: KeyboardEvent): void {
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
    } else if (event.key === 'Enter') {
      // While the panel is open the combobox owns Enter: commit the active option, and always
      // swallow the key so it can't submit a surrounding form with the list still showing.
      if (!this.isOpen()) return;
      event.preventDefault();
      const active = this.visibleOptions()[this.activeIndex()];
      if (active && !active.disabled) this.commitActiveOption(active);
    } else if (event.key === 'Escape') {
      if (this.isOpen()) {
        event.preventDefault();
        this.close();
      }
    } else if (event.key === 'Tab') {
      if (this.isOpen()) this.close();
    }
  }

  protected override filterVisibleOptions(options: Option<V>[]): Option<V>[] {
    if (this.belowMinQueryLength()) return [];
    // The options are already the answer to the query, decided wherever the list came from;
    // filtering them again here could only drop rows that answer it.
    if (this.filterMode() === 'none') return options;

    const query = this.query().trim().toLowerCase();
    if (!query) return options;
    // While the field shows the committed selection's label (not an active search), list everything.
    if (this.hasValue() && this.query() === this.selectedLabel()) return options;

    if (this.filterMode() === 'startsWith') {
      return options.filter(option => option.label.toLowerCase().startsWith(query));
    }
    return options.filter(option => option.label.toLowerCase().includes(query));
  }

  protected override hostStateClasses(): string[] {
    if (!this.loading()) return [];
    return [`${this.hostClassBase}--loading`];
  }

  protected override onClosed(): void {
    // Discard an unmatched free-text query, restoring the committed selection's label (or empty).
    this.query.set(this.selectedLabel());
  }

  protected override clear(): void {
    this.value.set(null);
    this.query.set('');
  }

  protected override getInitialActiveIndex(): number {
    const options = this.visibleOptions();

    if (this.hasValue()) {
      const selectedIndex = options.findIndex(
        option => !option.disabled && option.value === this.value(),
      );
      if (selectedIndex !== -1) return selectedIndex;
    }

    return options.findIndex(option => !option.disabled);
  }

  protected override commitActiveOption(option: Option<V>): void {
    this.select(option);
  }
}
