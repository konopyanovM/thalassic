import {
  AccordionContent,
  AccordionGroup,
  AccordionPanel,
  AccordionTrigger,
} from '@angular/aria/accordion';
import { NgTemplateOutlet } from '@angular/common';
import {
  booleanAttribute,
  Component,
  computed,
  contentChildren,
  inject,
  input,
  InputSignal,
  InputSignalWithTransform,
  Signal,
  viewChild,
} from '@angular/core';
import { Icon } from '../icon';
import { AccordionItem } from './accordion-item/accordion-item';
import { AccordionConfig } from './accordion.config';
import { ACCORDION_CONFIG } from './accordion.token';
import { accordionHeadingLevel, accordionVariant } from './accordion.types';

/**
 * A stack of collapsible sections. The container owns the policy shared by the
 * whole stack — how many sections may stay open, whether arrowing wraps, the
 * heading rank the items occupy — while each `tls-accordion-item` owns its own
 * expanded state.
 */
@Component({
  selector: 'tls-accordion',
  imports: [
    AccordionGroup,
    AccordionTrigger,
    AccordionPanel,
    AccordionContent,
    Icon,
    NgTemplateOutlet,
  ],
  templateUrl: './accordion.html',
  host: {
    '[class]': 'hostClasses()',
    // The accordion pattern gives the container no implicit role, so an
    // accessible name would go unexposed. `group` is applied only alongside a
    // name, leaving an unnamed stack out of the accessibility tree entirely.
    '[attr.role]': "hasAccessibleName() ? 'group' : null",
    '[attr.aria-label]': 'ariaLabel() ?? null',
    '[attr.aria-labelledby]': 'ariaLabelledby() ?? null',
  },
})
export class Accordion {
  // Injections
  private readonly _config: AccordionConfig = inject(ACCORDION_CONFIG);

  // Inputs
  public readonly variant: InputSignal<accordionVariant> = input<accordionVariant>(
    this._config.variant,
  );
  public readonly multiExpandable: InputSignalWithTransform<boolean, unknown> = input<
    boolean,
    unknown
  >(this._config.multiExpandable, { transform: booleanAttribute });
  public readonly headingLevel: InputSignal<accordionHeadingLevel> = input<accordionHeadingLevel>(
    this._config.headingLevel,
  );
  public readonly preserveContent: InputSignalWithTransform<boolean, unknown> = input<
    boolean,
    unknown
  >(this._config.preserveContent, { transform: booleanAttribute });
  public readonly wrap: InputSignalWithTransform<boolean, unknown> = input<boolean, unknown>(
    this._config.wrap,
    { transform: booleanAttribute },
  );
  public readonly softDisabled: InputSignalWithTransform<boolean, unknown> = input<
    boolean,
    unknown
  >(this._config.softDisabled, { transform: booleanAttribute });
  public readonly disabled: InputSignalWithTransform<boolean, unknown> = input<boolean, unknown>(
    false,
    { transform: booleanAttribute },
  );

  /** Accessible name for the stack as a whole. */
  public readonly ariaLabel = input<string | undefined>(undefined);
  public readonly ariaLabelledby = input<string | undefined>(undefined);

  // State
  protected readonly items: Signal<readonly AccordionItem[]> = contentChildren(AccordionItem);
  private readonly _group: Signal<AccordionGroup> = viewChild.required(AccordionGroup);

  // Computed
  protected readonly hostClasses: Signal<string[]> = computed<string[]>(() => {
    const className = 'tls-accordion';

    return [className, `${className}--${this.variant()}`];
  });

  protected readonly hasAccessibleName: Signal<boolean> = computed<boolean>(() =>
    Boolean(this.ariaLabel() ?? this.ariaLabelledby()),
  );

  // Public methods
  /** Expands every item. Takes effect only while the accordion is multi-expandable. */
  public expandAll(): void {
    this._group().expandAll();
  }

  public collapseAll(): void {
    this._group().collapseAll();
  }

  // Protected methods
  protected resolveHeadingLevel(item: AccordionItem): accordionHeadingLevel {
    const override = item.headingLevel();
    if (override !== undefined) return override;

    return this.headingLevel();
  }
}
