import { booleanAttribute, Component, computed, input, InputSignal } from '@angular/core';
import { Icon } from '../../icon';
import { controlSize } from '../../../types';

/**
 * The field-shaped shell shared by controls that keep their value behind a
 * panel: an input-like frame with the current value on the inline-start and a
 * chevron on the inline-end that turns while the panel is open. Purely
 * presentational — it renders the shell and a focusable trigger, and the
 * consumer attaches the panel itself (a `tlsMenuTrigger`, a popover) and
 * reports its state back through `open`, so any chooser reads as the field it
 * is rather than as a button.
 *
 * A control whose panel *is* a flat option list should be a `tls-select`; this
 * shell serves the choosers a select cannot express.
 */
@Component({
  selector: 'tls-picker-field',
  imports: [Icon],
  templateUrl: './picker-field.html',
  host: {
    '[class]': 'hostClasses()',
  },
})
export class PickerField {
  /** Whether the consumer's panel is open; turns the chevron and keeps the frame active. */
  readonly open = input(false, { transform: booleanAttribute });
  readonly size: InputSignal<controlSize> = input<controlSize>('md');
  readonly fluid = input(false, { transform: booleanAttribute });
  readonly disabled = input(false, { transform: booleanAttribute });
  /** Accessible name for the trigger, for a value face that is not self-describing. */
  readonly ariaLabel = input<string | undefined>();

  protected readonly hostClasses = computed(() => {
    const array = [
      'tls-picker-field',
      'tls-form-control',
      `tls-form-control--${this.size()}`,
    ];

    if (this.open()) array.push('tls-picker-field--open');
    if (this.fluid()) array.push('tls-form-control--fluid');
    if (this.disabled()) array.push('tls-form-control--disabled');

    return array;
  });
}
