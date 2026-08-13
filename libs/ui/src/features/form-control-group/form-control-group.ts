import {
  booleanAttribute,
  Component,
  computed,
  contentChildren,
  ElementRef,
  inject,
  input,
  InputSignal,
  InputSignalWithTransform,
  Signal,
} from '@angular/core';
import { FOCUSABLE_CONTROL_SELECTOR, FORM_CONTROL, FormControl } from '../../abstract/form';
import { controlSize } from '../../types';
import { FormControlGroupConfig } from './form-control-group.config';
import { FORM_CONTROL_ADDON_SELECTOR } from './form-control-group.constants';
import { FORM_CONTROL_GROUP_CONFIG } from './form-control-group.token';
import { ActivatableControl } from './form-control-group.types';

@Component({
  selector: 'tls-form-control-group',
  imports: [],
  template: '<ng-content></ng-content>',
  host: {
    '[class]': 'hostClasses()',
  },
})
export class FormControlGroup {
  // Injections
  private _config: FormControlGroupConfig = inject(FORM_CONTROL_GROUP_CONFIG);
  private readonly _elementRef: ElementRef<HTMLElement> = inject(ElementRef);

  // Content children
  /**
   * The controls projected into the field. A control that reports itself this way can be
   * activated rather than merely focused, which is what lets a click on an addon open a
   * select's list instead of leaving it shut.
   */
  private readonly _projectedControls = contentChildren<FormControl>(FORM_CONTROL, {
    descendants: true,
  });

  // Inputs
  public readonly size: InputSignal<controlSize> = input<controlSize>(this._config.size);
  public readonly fluid: InputSignalWithTransform<boolean, unknown> = input<boolean, unknown>(
    this._config.fluid,
    { transform: booleanAttribute },
  );

  // Computed
  protected readonly hostClasses: Signal<string[]> = computed(() => {
    const className = 'tls-form-control-group';
    const array: string[] = [className];

    array.push(`${className}--${this.size()}`);
    if (this.fluid()) array.push(`${className}--fluid`);

    return array;
  });

  // Public methods
  /**
   * Hands over a control the field wraps, opening its panel if it has one. A field may
   * hold several — a country select beside a phone number, the two ends of a range — so
   * `origin` names the element the request came from (an addon that was clicked) and the
   * control nearest it is taken. Without an origin the first control is. Does nothing
   * when the field wraps no enabled control.
   */
  public activateControl(origin?: Element): void {
    const controls: ActivatableControl[] = this._controls();
    if (controls.length === 0) return;

    if (!origin) {
      controls[0].activate();
      return;
    }

    this._nearestControl(controls, origin).activate();
  }

  // Private methods
  /**
   * Every control the field can hand over, in document order.
   *
   * A projected control is taken at its word — it knows which of its elements takes
   * focus and what handing it over means. Anything else focusable is included as a bare
   * element, so a field assembled from native markup rather than the library's controls
   * behaves the same; elements already covered by a projected control are left out so
   * neither is counted twice. Addon contents are chrome around the value rather than the
   * value, and a disabled control cannot take focus — `:disabled` reads the element's
   * actual state, so it also covers one switched off by an ancestor `<fieldset>` rather
   * than by an attribute of its own.
   */
  private _controls(): ActivatableControl[] {
    const projected: FormControl[] = this._projectedControls().filter(
      control =>
        !control.disabled() &&
        // A control can decorate the field instead of holding its value — a unit picker
        // inside an addon. It is reached by clicking it, never by a click elsewhere.
        !control.elementRef.nativeElement.closest(FORM_CONTROL_ADDON_SELECTOR),
    );

    const controls: ActivatableControl[] = projected.map(control => ({
      element: control.elementRef.nativeElement,
      activate: () => control.activate(),
    }));

    const candidates: NodeListOf<HTMLElement> =
      this._elementRef.nativeElement.querySelectorAll<HTMLElement>(FOCUSABLE_CONTROL_SELECTOR);

    for (const candidate of Array.from(candidates)) {
      if (candidate.closest(FORM_CONTROL_ADDON_SELECTOR)) continue;
      if (candidate.matches(':disabled')) continue;
      if (projected.some(control => control.elementRef.nativeElement.contains(candidate))) continue;

      controls.push({ element: candidate, activate: () => candidate.focus() });
    }

    return this._inDocumentOrder(controls);
  }

  /** Row order, so a request without an origin lands on the field's first control. */
  private _inDocumentOrder(controls: ActivatableControl[]): ActivatableControl[] {
    const children: Element[] = Array.from(this._elementRef.nativeElement.children);

    return controls
      .map(control => ({
        control,
        index: children.findIndex(child => child.contains(control.element)),
      }))
      .sort((one, other) => one.index - other.index)
      .map(entry => entry.control);
  }

  /**
   * The control closest to `origin`, measured in places along the row rather than in
   * pixels, so it holds however the children are laid out. A tie — an addon sitting
   * between two controls — goes to the one that follows, the way a prefix belongs to
   * what comes after it. Distance is counted in document order, which runs start-to-end
   * in both directions, so this needs no separate right-to-left case.
   */
  private _nearestControl(controls: ActivatableControl[], origin: Element): ActivatableControl {
    const children: Element[] = Array.from(this._elementRef.nativeElement.children);
    const originIndex: number = children.findIndex(child => child.contains(origin));
    if (originIndex === -1) return controls[0];

    let nearest: ActivatableControl = controls[0];
    let shortestDistance = Number.POSITIVE_INFINITY;

    for (const control of controls) {
      const index: number = children.findIndex(child => child.contains(control.element));
      const distance: number = Math.abs(index - originIndex);

      if (distance < shortestDistance || (distance === shortestDistance && index > originIndex)) {
        nearest = control;
        shortestDistance = distance;
      }
    }

    return nearest;
  }
}
