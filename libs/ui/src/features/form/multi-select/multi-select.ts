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
import { AbstractSelect, FORM_CONTROL, Option } from '../../../abstract/form';
import { controlSize } from '../../../types';
import { Icon } from '../../icon';
import { Loader } from '../../loader';
import { MULTI_SELECT_CONFIG } from './multi-select.token';

@Component({
  selector: 'tls-multi-select',
  templateUrl: './multi-select.html',
  imports: [Loader, Icon],
  host: {
    '[class]': 'hostClasses()',
  },
  providers: [{ provide: FORM_CONTROL, useExisting: forwardRef(() => MultiSelect) }],
})
export class MultiSelect<T, V = unknown> extends AbstractSelect<T, V, V[]> {
  private static _nextUniqueId = 0;

  private readonly _config = inject(MULTI_SELECT_CONFIG);

  override readonly supportsLabelFor = true;

  protected readonly uniqueId = `tls-multi-select-${MultiSelect._nextUniqueId++}`;
  protected readonly hostClassBase = 'tls-multi-select';
  protected readonly panelClass = 'tls-multi-select-panel';

  public readonly value: ModelSignal<V[]> = model<V[]>([]);
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
  public readonly maxLabels = input<number>(this._config.maxLabels);

  protected readonly hasValue: Signal<boolean> = computed(() => this.value().length > 0);

  protected readonly selectedValues: Signal<Set<V>> = computed(() => new Set(this.value()));

  protected readonly triggerLabel: Signal<string> = computed(() => {
    const selected = this.value();
    if (selected.length === 0) return '';

    const max = this.maxLabels();
    if (selected.length > max) return `${selected.length} selected`;

    const optionMap = new Map(this.normalizedOptions().map(option => [option.value, option.label]));
    return selected.map(value => optionMap.get(value) ?? String(value)).join(', ');
  });

  protected isSelected(option: Option<V>): boolean {
    return this.selectedValues().has(option.value);
  }

  protected toggleOption(option: Option<V>): void {
    if (option.disabled) return;
    if (this.isSelected(option)) {
      this.value.update(current => current.filter(item => item !== option.value));
    } else {
      this.value.update(current => [...current, option.value]);
    }
  }

  protected override clear(): void {
    this.value.set([]);
  }

  protected override getInitialActiveIndex(): number {
    const options = this.visibleOptions();
    const selected = this.selectedValues();

    const firstSelected = options.findIndex(
      option => !option.disabled && selected.has(option.value),
    );
    if (firstSelected !== -1) return firstSelected;

    return options.findIndex(option => !option.disabled);
  }

  protected override commitActiveOption(option: Option<V>): void {
    this.toggleOption(option);
  }
}
