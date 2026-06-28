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
  Signal,
  TemplateRef
} from '@angular/core';
import { FORM_CONTROL, Option, SelectionGroup, selectionGroupTemplateContext } from '../../../abstract/form';
import { controlSize, orientation } from '../../../types';
import { Chip, chipColor, chipVariant } from '../../chip';
import { CHIP_GROUP_CONFIG } from './chip-group.token';

@Component({
  selector: 'tls-chip-group',
  templateUrl: './chip-group.html',
  imports: [NgTemplateOutlet, Chip],
  providers: [{ provide: FORM_CONTROL, useExisting: forwardRef(() => ChipGroup) }],
  host: {
    role: 'group',
    '[class]': 'classes()',
  },
})
/**
 * `value` is always an array — in single mode (`multiple = false`) it holds 0 or
 * 1 items, read it as `value()[0]`. See {@link SelectionGroup} for the contract.
 */
export class ChipGroup<T, V = unknown> extends SelectionGroup<T, V> {
  private readonly _config = inject(CHIP_GROUP_CONFIG);

  protected override CLASS_NAME = 'tls-chip-group';

  public override readonly multiple: InputSignalWithTransform<boolean, unknown> = input(
    this._config.multiple,
    { transform: booleanAttribute },
  );
  public override readonly unselectable: InputSignalWithTransform<boolean, unknown> = input<
    boolean,
    unknown
  >(this._config.unselectable, { transform: booleanAttribute });
  public readonly size: InputSignal<controlSize> = input<controlSize>(this._config.size);
  public readonly color: InputSignal<chipColor> = input<chipColor>(this._config.color);
  public readonly checkedColor = input<chipColor | undefined>(this._config.checkedColor);
  public readonly variant: InputSignal<chipVariant> = input<chipVariant>(this._config.variant);
  public readonly checkedVariant = input<chipVariant | undefined>(this._config.checkedVariant);
  public readonly orientation: InputSignal<orientation> = input<orientation>(
    this._config.orientation,
  );
  public readonly rounded: InputSignalWithTransform<boolean, unknown> = input<boolean, unknown>(
    this._config.rounded,
    { transform: booleanAttribute },
  );
  public readonly fluid: InputSignalWithTransform<boolean, unknown> = input<boolean, unknown>(
    this._config.fluid,
    { transform: booleanAttribute },
  );

  protected readonly startIconTemplate =
    contentChild<TemplateRef<selectionGroupTemplateContext<T, V>>>('startIcon');
  protected readonly endIconTemplate =
    contentChild<TemplateRef<selectionGroupTemplateContext<T, V>>>('endIcon');
  protected readonly labelTemplate =
    contentChild<TemplateRef<selectionGroupTemplateContext<T, V>>>('label');

  protected readonly classes: Signal<string[]> = computed(() => {
    const className = this.CLASS_NAME;
    const array = [className, `${className}--${this.orientation()}`];
    if (this.fluid()) array.push(`${className}--fluid`);
    return array.concat(this.controlClasses());
  });

  protected isDisabled(option: Option<V>): boolean {
    return this.disabled() || option.disabled;
  }

  protected optionClasses(option: Option<V>): string[] {
    const classes = ['tls-chip--control'];

    if (this.isSelected(option.value)) {
      classes.push('tls-chip--checked');

      const checkedColor = this.checkedColor();
      if (checkedColor) classes.push(`tls-chip--checked-${checkedColor}`);

      const checkedVariant = this.checkedVariant();
      if (checkedVariant) classes.push(`tls-chip--checked-${checkedVariant}`);
    }

    if (this.isDisabled(option)) classes.push('tls-chip--disabled');

    return classes;
  }
}
