import { accordionHeadingLevel, accordionVariant } from './accordion.types';

export interface AccordionConfig {
  variant: accordionVariant;
  /** Whether more than one item may stay expanded at a time. */
  multiExpandable: boolean;
  headingLevel: accordionHeadingLevel;
  /**
   * Whether a panel's content stays in the DOM once it has been expanded. The
   * collapse transition needs the content to outlive the collapse, so turning
   * this off trades the outgoing animation for a smaller DOM.
   */
  preserveContent: boolean;
  /** Whether arrowing past the last trigger returns to the first, and vice versa. */
  wrap: boolean;
  /**
   * Whether a disabled trigger still receives focus. Keeping it focusable lets a
   * screen-reader user reach the item and hear that it is unavailable, rather
   * than the item vanishing from the keyboard order.
   */
  softDisabled: boolean;
}

export const DEFAULT_ACCORDION_CONFIG: AccordionConfig = {
  variant: 'flat',
  multiExpandable: false,
  headingLevel: 3,
  preserveContent: true,
  wrap: false,
  softDisabled: true,
};
