import { NgTemplateOutlet } from '@angular/common';
import {
  booleanAttribute,
  Component,
  computed,
  contentChild,
  ElementRef,
  forwardRef,
  inject,
  input,
  InputSignal,
  InputSignalWithTransform,
  Signal,
  TemplateRef,
  viewChildren,
} from '@angular/core';
import {
  FORM_CONTROL,
  SelectionGroup,
  selectionGroupTemplateContext,
} from '../../../abstract/form';
import { color, controlSize, orientation } from '../../../types';
import { RippleDirective } from '../../ripple';
import { slidingIndicator } from '../../sliding-indicator';
import { TOGGLE_GROUP_CONFIG } from './toggle-group.token';
import { toggleGroupVariant } from './toggle-group.types';

@Component({
  selector: 'tls-toggle-group',
  templateUrl: './toggle-group.html',
  imports: [NgTemplateOutlet, RippleDirective],
  providers: [{ provide: FORM_CONTROL, useExisting: forwardRef(() => ToggleGroup) }],
  host: {
    role: 'group',
    class: 'tls-toggle-group',
    '[class]': 'classes()',
    '[attr.aria-label]': 'ariaLabel() ?? null',
    '[attr.aria-labelledby]': 'labelledBy()',
    '[attr.aria-describedby]': 'describedBy()',
    '[attr.aria-invalid]': "invalid() ? 'true' : null",
  },
})
/**
 * `value` is always an array — in single mode (`multiple = false`) it holds 0 or
 * 1 items, read it as `value()[0]`. See {@link SelectionGroup} for the contract.
 */
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
  /**
   * How the options are drawn: joined into one strip and filled with `color`
   * where chosen (`filled`, `tonal`), or set apart on a track with the chosen
   * one lifted off it as a pill (`segmented`), which ignores `color`.
   */
  public readonly variant: InputSignal<toggleGroupVariant> = input<toggleGroupVariant>(
    this._config.variant,
  );
  public readonly orientation: InputSignal<orientation> = input<orientation>(
    this._config.orientation,
  );
  /** Whether the group stretches to fill its container's width with equal-width options. */
  public readonly fluid: InputSignalWithTransform<boolean, unknown> = input<boolean, unknown>(
    this._config.fluid,
    { transform: booleanAttribute },
  );

  protected readonly optionTemplate =
    contentChild<TemplateRef<selectionGroupTemplateContext<T, V>>>('option');

  private readonly _optionButtons: Signal<readonly ElementRef<HTMLButtonElement>[]> =
    viewChildren<ElementRef<HTMLButtonElement>>('optionButton');

  /**
   * The option a single travelling pill marks: the one chosen, in a segmented
   * group that takes one choice. Nothing in a joined treatment, in a group of
   * several choices — each keeps a pill of its own — or with nothing chosen.
   */
  private readonly _markedOption: Signal<HTMLButtonElement | null> = computed(() => {
    if (this.variant() !== 'segmented' || this.multiple()) return null;

    const chosen = this.value();
    if (chosen.length !== 1) return null;

    const index = this.normalizedOptions().findIndex(option => option.value === chosen[0]);
    const button = this._optionButtons()[index];
    return button ? button.nativeElement : null;
  });

  protected readonly classes: Signal<string[]> = computed(() => {
    const className = this.CLASS_NAME;
    const array = [
      className,
      `${className}--${this.size()}`,
      `${className}--${this.color()}`,
      `${className}--${this.variant()}`,
      `${className}--${this.orientation()}`,
    ];
    if (this.fluid()) array.push(`${className}--fluid`);
    return array.concat(this.controlClasses());
  });

  constructor() {
    super();

    slidingIndicator({
      container: () => this.elementRef.nativeElement,
      target: this._markedOption,
      orientation: this.orientation,
    });
  }
}
