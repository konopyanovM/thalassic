import {
  booleanAttribute,
  Component,
  computed,
  ElementRef,
  inject,
  input,
  InputSignalWithTransform,
  Signal,
} from '@angular/core';
import { FormControl } from '../../../abstract/form';
import { FormControlGroup } from '../form-control-group';
import { INTERACTIVE_ADDON_CONTENT_SELECTOR } from './form-control-addon.constants';

@Component({
  selector: 'tls-form-control-addon',
  imports: [],
  template: '<ng-content></ng-content>',
  host: {
    '[class]': 'hostClasses()',
    '(click)': 'onClick($event)',
  },
})
export class FormControlAddon {
  // Injections
  private readonly _group: FormControlGroup | null = inject(FormControlGroup, { optional: true });
  private readonly _elementRef: ElementRef<HTMLElement> = inject(ElementRef);

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

  /**
   * Whether clicking the addon hands the field's control over, the way clicking a
   * `<label>` reaches the input it names — focus for a control edited in place, focus
   * and an open panel for one whose value lives behind a list or a calendar. On by
   * default: an addon sits inside the field's border, so it reads as part of the field
   * and a click that landed nowhere would feel broken. Turn it off for an addon whose
   * content is meant to be selected or copied rather than treated as a way in.
   */
  public readonly focusControl: InputSignalWithTransform<boolean, unknown> = input<
    boolean,
    unknown
  >(true, { transform: booleanAttribute });

  /**
   * The control a click hands over to, named by template reference:
   *
   * ```html
   * <tls-input #amount />
   * <tls-form-control-addon [control]="amount">USD</tls-form-control-addon>
   * ```
   *
   * Unset, the addon takes the control nearest it in the row, which is what a field of
   * one control — or an addon sitting against the control it belongs to — already wants.
   * Name the control when the row leaves that ambiguous: an addon between two controls,
   * or one that belongs to a control further along.
   */
  public readonly control = input<FormControl | HTMLElement | undefined>(undefined);

  // Computed
  protected readonly hostClasses: Signal<string[]> = computed(() => {
    const className = 'tls-form-control-addon';
    const array: string[] = [className];

    if (this.divider()) array.push(`${className}--divider`);

    return array;
  });

  // Protected methods
  protected onClick(event: MouseEvent): void {
    if (!this.focusControl()) return;

    // An icon is drawn with SVG, whose elements are not HTMLElement — narrow to Element
    // so a click on the artwork still counts.
    const target = event.target;
    if (!(target instanceof Element)) return;

    // Scoped to the addon's own subtree: an interactive ancestor further up — a row
    // wrapped in a link, say — is not what the click was aimed at.
    const interactiveContent: Element | null = target.closest(INTERACTIVE_ADDON_CONTENT_SELECTOR);
    if (interactiveContent && this._elementRef.nativeElement.contains(interactiveContent)) return;

    const control = this.control();
    if (control) {
      if (control instanceof FormControl) control.activate();
      else control.focus();
      return;
    }

    if (!this._group) return;

    // The addon names itself as the origin so a field holding several controls hands
    // over the one beside it rather than the one that happens to come first.
    this._group.activateControl(this._elementRef.nativeElement);
  }
}
