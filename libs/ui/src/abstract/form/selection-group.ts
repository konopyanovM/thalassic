import {
  computed,
  Directive,
  input,
  InputSignal,
  model,
  ModelSignal,
  Signal,
} from '@angular/core';
import { normalizeOptions, Option, optionInput } from './options';
import { selectionGroupTemplateContext } from './selection-group.types';
import { ValueFormControl } from './value-form-control';

/**
 * Shared base for controls that present a list of options and store the
 * selected option values as an array (e.g. toggle group, chip group).
 *
 * Subclasses provide the visual shell and own the `multiple` and `unselectable`
 * inputs (defaults differ per component), while this base owns the selection
 * state machine: value model, option normalization, and the toggle logic.
 *
 * `value` is ALWAYS an array, regardless of `multiple`. In single mode
 * (`multiple = false`) it holds 0 or 1 items — read the selection as
 * `value()[0]`. In multiple mode it holds every selected value. This is a
 * deliberate, strongly-typed contract: unlike Select/MultiSelect (which split
 * scalar `V | null` vs array `V[]` into two components), this family stays a
 * single unified component and keeps one `V[]` type rather than loosening it to
 * a runtime-dependent `V | V[]`.
 */
@Directive()
export abstract class SelectionGroup<T, V = unknown> extends ValueFormControl<V[]> {
  public override readonly value: ModelSignal<V[]> = model<V[]>([]);

  public readonly options: InputSignal<optionInput<T>[]> = input<optionInput<T>[]>([]);
  public readonly optionLabel = input<keyof T | undefined>(undefined);
  public readonly optionValue = input<keyof T | undefined>(undefined);
  public readonly optionDisabled = input<keyof T | undefined>(undefined);

  public abstract readonly multiple: Signal<boolean>;
  public abstract readonly unselectable: Signal<boolean>;

  protected readonly normalizedOptions: Signal<Option<V>[]> = computed(() =>
    normalizeOptions<T, V>(this.options(), {
      label: this.optionLabel(),
      value: this.optionValue(),
      disabled: this.optionDisabled(),
    }),
  );

  protected isSelected(optionValue: V): boolean {
    return this.value().includes(optionValue);
  }

  protected select(option: Option<V>): void {
    if (this.notInteractive() || option.disabled) return;

    if (!this.multiple()) {
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

  protected onKeyboardSelect(event: Event, option: Option<V>): void {
    event.preventDefault();
    this.select(option);
  }

  protected optionContext(option: Option<V>, index: number): selectionGroupTemplateContext<T, V> {
    return {
      $implicit: {
        option: option.source as T,
        value: option.value,
        label: option.label,
        index,
        selected: this.isSelected(option.value),
        disabled: this.disabled() || option.disabled,
      },
    };
  }
}
