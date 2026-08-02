import {
  booleanAttribute,
  Component,
  computed,
  forwardRef,
  inject,
  input,
  InputSignal,
  InputSignalWithTransform,
  model,
  ModelSignal,
  Signal,
} from '@angular/core';
import { NgTemplateOutlet } from '@angular/common';
import { AbstractSelect, FORM_CONTROL, Option } from '../../../abstract/form';
import { controlSize } from '../../../types';
import { Icon } from '../../icon';
import { Loader } from '../../loader';
import { SELECT_CONFIG } from './select.token';

@Component({
  selector: 'tls-select',
  templateUrl: './select.html',
  imports: [Loader, Icon, NgTemplateOutlet],
  host: {
    '[class]': 'hostClasses()',
  },
  providers: [{ provide: FORM_CONTROL, useExisting: forwardRef(() => Select) }],
})
export class Select<T, V = unknown> extends AbstractSelect<T, V, V | null> {
  private static _nextUniqueId = 0;

  private readonly _config = inject(SELECT_CONFIG);

  override readonly supportsLabelFor = true;

  protected readonly uniqueId = `tls-select-${Select._nextUniqueId++}`;
  protected readonly hostClassBase = 'tls-select';
  protected readonly panelClass = 'tls-select-panel';

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
  public readonly clearLabel = input<string>(this._config.clearLabel);

  protected readonly hasValue: Signal<boolean> = computed(() => {
    const value = this.value();
    return value !== null && value !== undefined && value !== '';
  });

  protected readonly selectedLabel: Signal<string> = computed(() => {
    if (!this.hasValue()) return '';
    const selected = this.normalizedOptions().find(option => option.value === this.value());
    if (!selected) return '';
    return selected.label;
  });

  protected select(option: Option<V>): void {
    if (option.disabled) return;
    this.value.set(option.value);
    this.close();
  }

  protected isOptionSelected(option: Option<V>): boolean {
    return option.value === this.value();
  }

  protected override clear(): void {
    this.value.set(null);
  }

  protected override getInitialActiveIndex(): number {
    const options = this.visibleOptions();

    const selectedIndex = options.findIndex(
      option => !option.disabled && option.value === this.value(),
    );
    if (selectedIndex !== -1) return selectedIndex;

    // No selection: start on the first enabled option, matching the other
    // listbox controls, so the panel opens with a visible active option.
    return options.findIndex(option => !option.disabled);
  }

  protected override commitActiveOption(option: Option<V>): void {
    this.select(option);
  }
}
