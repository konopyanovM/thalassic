import {
  booleanAttribute,
  Component,
  computed,
  input,
  InputSignalWithTransform,
  Signal,
} from '@angular/core';

@Component({
  selector: 'tls-form-control-addon',
  imports: [],
  template: '<ng-content></ng-content>',
  host: {
    '[class]': 'hostClasses()',
  },
})
export class FormControlAddon {
  // Inputs
  /**
   * Whether a rule is drawn on each edge the addon shares with a sibling, seaming it
   * off from the control beside it. Off by default: a field reads as one surface, and
   * a rule is worth its weight only when the addon is a distinct region — an action,
   * a unit selector — rather than a hint attached to the value.
   */
  public readonly divider: InputSignalWithTransform<boolean, unknown> = input<boolean, unknown>(
    false,
    { transform: booleanAttribute },
  );

  // Computed
  protected readonly hostClasses: Signal<string[]> = computed(() => {
    const className = 'tls-form-control-addon';
    const array: string[] = [className];

    if (this.divider()) array.push(`${className}--divider`);

    return array;
  });
}
