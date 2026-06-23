import { NgTemplateOutlet } from '@angular/common';
import {
  booleanAttribute,
  Component,
  computed,
  contentChild,
  inject,
  input,
  InputSignal,
  signal,
  TemplateRef,
} from '@angular/core';
import { controlSize } from '../../types';
import { CHIP_CONFIG } from './chip.token';
import { ChipContext, chipColor, chipTemplateContext, chipVariant } from './chip.types';

@Component({
  selector: 'tls-chip',
  imports: [NgTemplateOutlet],
  templateUrl: './chip.html',
  host: {
    '[class]': 'classes()',
  },
})
export class Chip {
  private _config = inject(CHIP_CONFIG);

  public readonly label = input<string>();
  public readonly color: InputSignal<chipColor> = input<chipColor>(this._config.color);
  public readonly variant: InputSignal<chipVariant> = input<chipVariant>(this._config.variant);
  public readonly size: InputSignal<controlSize> = input<controlSize>(this._config.size);
  public readonly rounded = input(false, { transform: booleanAttribute });
  public readonly icon = input(false, { transform: booleanAttribute });
  public readonly fluid = input(false, { transform: booleanAttribute });

  public readonly context = signal<ChipContext>({
    checked: false,
    disabled: false,
    readonly: false,
    touched: false,
    dirty: false,
    invalid: false,
    pending: false,
  });

  protected readonly startIconTemplate = contentChild<TemplateRef<chipTemplateContext>>('startIcon');
  protected readonly endIconTemplate = contentChild<TemplateRef<chipTemplateContext>>('endIcon');

  protected classes = computed(() => {
    const className = 'tls-chip';
    const array: string[] = [className];

    array.push(`${className}--${this.color()}`);
    array.push(`${className}--${this.variant()}`);
    array.push(`${className}--${this.size()}`);

    if (this.rounded()) array.push(`${className}--rounded`);
    if (this.icon()) array.push(`${className}--icon`);
    if (this.fluid()) array.push(`${className}--fluid`);

    return array;
  });
}
