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
  TemplateRef,
} from '@angular/core';
import {
  FORM_CONTROL,
  SelectionGroup,
  selectionGroupTemplateContext,
} from '../../../abstract/form';
import { color, controlSize, orientation } from '../../../types';
import { TOGGLE_GROUP_CONFIG } from './toggle-group.token';

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
export class ToggleGroup<T, V = unknown> extends SelectionGroup<T, V> {
  private readonly _config = inject(TOGGLE_GROUP_CONFIG);

  protected override CLASS_NAME = 'tls-toggle-group';

  public override readonly multiple: InputSignalWithTransform<boolean, unknown> = input(
    this._config.multiple,
    { transform: booleanAttribute },
  );
  public override readonly unselectable: InputSignalWithTransform<boolean, unknown> = input<
    boolean,
    unknown
  >(this._config.unselectable, { transform: booleanAttribute });
  public readonly size: InputSignal<controlSize> = input<controlSize>(this._config.size);
  public readonly color: InputSignal<color> = input<color>(this._config.color);
  public readonly orientation: InputSignal<orientation> = input<orientation>(
    this._config.orientation,
  );

  protected readonly optionTemplate =
    contentChild<TemplateRef<selectionGroupTemplateContext<T, V>>>('option');

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
}
