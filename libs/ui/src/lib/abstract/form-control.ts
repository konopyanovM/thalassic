import {
  booleanAttribute,
  computed,
  Directive,
  input,
  InputSignal,
  InputSignalWithTransform,
  Signal,
  signal,
  WritableSignal,
} from '@angular/core';
import { ControlValueAccessor } from '@angular/forms';

@Directive({
  host: { '[tabindex]': '-1' },
})
export abstract class FormControl<T = unknown> implements ControlValueAccessor {
  public disabled: InputSignalWithTransform<boolean, unknown> = input(false, {
    transform: booleanAttribute,
  });
  public readonly: InputSignalWithTransform<boolean, unknown> = input(false, {
    transform: booleanAttribute,
  });
  public tabindex: InputSignal<number> = input<number>(0);

  protected abstract value: WritableSignal<T>;
  private _controlDisabled = signal<boolean | null>(null);

  protected isDisabled: Signal<boolean> = computed<boolean>(() => {
    const controlDisabled = this._controlDisabled();
    if (controlDisabled !== null) return controlDisabled;
    return this.disabled();
  });
  protected notInteractive = computed(() => this.isDisabled() || this.readonly());

  protected onChange: ((value: T) => void) | null = null;
  protected onTouched: (() => void) | null = null;

  // Control Value Accessor methods
  public writeValue(value: T) {
    this.value.set(value);
  }

  public setDisabledState(isDisabled: boolean) {
    this._controlDisabled.set(isDisabled);
  }

  public registerOnChange(fn: (value: T) => void) {
    this.onChange = fn;
  }

  public registerOnTouched(fn: () => void) {
    this.onTouched = fn;
  }

  // Protected methods
  protected setValue(value: T) {
    this.value.set(value);

    if (this.onChange) this.onChange(value);
    if (this.onTouched) this.onTouched();
  }
}
