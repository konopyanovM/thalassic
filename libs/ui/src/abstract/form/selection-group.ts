import { computed, Directive, input, InputSignal, model, ModelSignal, Signal } from '@angular/core';
import { normalizeOptions } from './normalize-options';
import { Option } from './option';
import { optionInput } from './option-input';
import { selectionMode } from './selection-mode';
import { ValueFormControl } from './value-form-control';

/**
 * Shared base for controls that present a list of options and store the
 * selected option values as an array (e.g. toggle group, chip group).
 *
 * Subclasses provide the visual shell plus the `type`/`unselectable` inputs
 * (their defaults differ per component), while this base owns the selection
 * state machine: value model, option normalization, and the toggle logic.
 */
@Directive()
export abstract class SelectionGroup<T, V = unknown> extends ValueFormControl<V[]> {
  public override readonly value: ModelSignal<V[]> = model<V[]>([]);

  public readonly options: InputSignal<optionInput<T>[]> = input<optionInput<T>[]>([]);
  public readonly optionLabel = input<keyof T | undefined>(undefined);
  public readonly optionValue = input<keyof T | undefined>(undefined);
  public readonly optionDisabled = input<keyof T | undefined>(undefined);

  public abstract readonly type: Signal<selectionMode>;
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

  protected onKeyboardSelect(event: Event, option: Option<V>): void {
    event.preventDefault();
    this.select(option);
  }
}

