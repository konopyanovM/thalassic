import { NgTemplateOutlet } from '@angular/common';
import {
  booleanAttribute,
  Component,
  computed,
  contentChild,
  forwardRef,
  inject,
  input,
  InputSignal,
  InputSignalWithTransform,
  model,
  ModelSignal,
  Signal,
  TemplateRef,
} from '@angular/core';
import {
  FORM_CONTROL,
  normalizeOptions,
  Option,
  optionInput,
  ValueFormControl,
} from '../../../abstract/form';
import { color, controlSize, orientation } from '../../../types';
import { TOGGLE_GROUP_CONFIG } from './toggle-group.token';
import { toggleGroupType } from './toggle-group.types';

@Component({
  selector: 'tls-toggle-group',
  templateUrl: './toggle-group.html',
  imports: [NgTemplateOutlet],
  providers: [{ provide: FORM_CONTROL, useExisting: forwardRef(() => ToggleGroup) }],
  host: {
    role: 'group',
    '[class]': 'classes()',
  },
})
export class ToggleGroup<T, V = unknown> extends ValueFormControl<V[]> {
  private readonly _config = inject(TOGGLE_GROUP_CONFIG);

  protected override CLASS_NAME = 'tls-toggle-group';

  public readonly value: ModelSignal<V[]> = model<V[]>([]);
  public readonly options: InputSignal<optionInput<T>[]> = input<optionInput<T>[]>([]);
  public readonly optionLabel = input<keyof T | undefined>(undefined);
  public readonly optionValue = input<keyof T | undefined>(undefined);
  public readonly optionDisabled = input<keyof T | undefined>(undefined);
  public readonly type: InputSignal<toggleGroupType> = input<toggleGroupType>(this._config.type);
  public readonly unselectable: InputSignalWithTransform<boolean, unknown> = input<
    boolean,
    unknown
  >(this._config.unselectable, { transform: booleanAttribute });
  public readonly size: InputSignal<controlSize> = input<controlSize>(this._config.size);
  public readonly color: InputSignal<color> = input<color>(this._config.color);
  public readonly orientation: InputSignal<orientation> = input<orientation>(
    this._config.orientation,
  );

  protected readonly optionTemplate =
    contentChild<TemplateRef<{ $implicit: Option<V> }>>('option');

  protected readonly normalizedOptions: Signal<Option<V>[]> = computed(() =>
    normalizeOptions<T, V>(this.options(), {
      label: this.optionLabel(),
      value: this.optionValue(),
      disabled: this.optionDisabled(),
    }),
  );

  protected readonly classes: Signal<string[]> = computed(() => {
    const className = this.CLASS_NAME;
    const array = [
      className,
      `${className}--${this.size()}`,
      `${className}--${this.color()}`,
      `${className}--${this.orientation()}`,
    ];
    return array.concat(this.controlClasses());
  });

  protected isSelected(optionValue: V): boolean {
    return this.value().includes(optionValue);
  }

  protected select(option: Option<V>): void {
    if (this.notInteractive() || option.disabled) return;

    if (this.type() === 'single') {
      if (this.isSelected(option.value) && !this.unselectable()) return;
      this.value.set(this.isSelected(option.value) ? [] : [option.value]);
      return;
    }

    if (this.isSelected(option.value)) {
      this.value.update(current => current.filter(item => item !== option.value));
    } else {
      this.value.update(current => [...current, option.value]);
    }
  }
}
