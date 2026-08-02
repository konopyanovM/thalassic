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
  Signal,
  WritableSignal,
} from '@angular/core';
import { NgTemplateOutlet } from '@angular/common';
import { AbstractSelect, FORM_CONTROL, Option } from '../../../abstract/form';
import { controlSize } from '../../../types';
import { Icon } from '../../icon';
import { Loader } from '../../loader';
import { autocompleteFilterMode } from './autocomplete-filter-mode';
import { AUTOCOMPLETE_CONFIG } from './autocomplete.token';

@Component({
  selector: 'tls-autocomplete',
  templateUrl: './autocomplete.html',
  imports: [Loader, Icon, NgTemplateOutlet],
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
  public readonly filterMode = input<autocompleteFilterMode>(this._config.filterMode);
  public readonly emptyMessage = input<string>(this._config.emptyMessage);
  public readonly clearLabel = input<string>(this._config.clearLabel);

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
    const query = this.query().trim().toLowerCase();
    if (!query) return options;
    // While the field shows the committed selection's label (not an active search), list everything.
    if (this.hasValue() && this.query() === this.selectedLabel()) return options;

    if (this.filterMode() === 'startsWith') {
      return options.filter(option => option.label.toLowerCase().startsWith(query));
    }
    return options.filter(option => option.label.toLowerCase().includes(query));
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
