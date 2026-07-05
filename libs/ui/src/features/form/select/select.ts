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
import { SELECT_CONFIG } from './select.token';

@Component({
  selector: 'tls-select',
  templateUrl: './select.html',
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

  protected override clear(): void {
    this.value.set(null);
  }

  protected override getInitialActiveIndex(): number {
    return this.normalizedOptions().findIndex(option => option.value === this.value());
  }

  protected override commitActiveOption(option: Option<V>): void {
    this.select(option);
  }
}
