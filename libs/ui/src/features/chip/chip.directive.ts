import { computed, Directive, effect, forwardRef, inject, input, model } from '@angular/core';
import { CheckboxFormControl, FORM_CONTROL } from '../../abstract/form';
import { Chip } from './chip';
import { CHIP_CONTROL_CONFIG } from './chip-control.token';
import { chipColor, chipVariant } from './chip.types';

@Directive({
  selector: 'tls-chip[tlsChipControl]',
  host: {
    role: 'checkbox',
    '[class]': 'hostClasses()',
    '[tabindex]': 'disabled() ? -1 : 0',
    '[attr.aria-checked]': 'checked()',
    '[attr.aria-disabled]': 'disabled()',
    '(click)': 'toggle()',
    '(blur)': 'touched.set(true)',
    '(keydown.space)': 'onKeyboardToggle($event)',
    '(keydown.enter)': 'onKeyboardToggle($event)',
  },
  providers: [{ provide: FORM_CONTROL, useExisting: forwardRef(() => ChipControl) }],
})
export class ChipControl extends CheckboxFormControl {
  protected override CLASS_NAME = 'tls-chip';

  private _config = inject(CHIP_CONTROL_CONFIG);
  private _chip = inject(Chip);

  public readonly checked = model<boolean>(false);

  public readonly checkedColor = input<chipColor | undefined>(this._config.checkedColor);

  public readonly checkedVariant = input<chipVariant | undefined>(this._config.checkedVariant);

  protected hostClasses = computed(() => {
    const classes: string[] = ['tls-chip--control'];

    if (this.checked()) {
      classes.push('tls-chip--checked');

      const color = this.checkedColor();
      if (color) classes.push(`tls-chip--checked-${color}`);

      const variant = this.checkedVariant();
      if (variant) classes.push(`tls-chip--checked-${variant}`);
    }

    if (this.disabled()) classes.push('tls-chip--disabled');

    return classes;
  });

  constructor() {
    super();
    effect(() => this._chip.context.set({
      checked: this.checked(),
      disabled: this.disabled(),
      readonly: this.readonly(),
      touched: this.touched(),
      dirty: this.dirty(),
      invalid: this.invalid(),
      pending: this.pending(),
    }));
  }

  protected toggle(): void {
    if (this.notInteractive()) return;
    this.checked.update(prev => !prev);
  }

  protected onKeyboardToggle(event: Event): void {
    event.preventDefault();
    this.toggle();
  }
}
