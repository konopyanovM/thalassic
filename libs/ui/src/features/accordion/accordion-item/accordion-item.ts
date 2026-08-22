import {
  booleanAttribute,
  Component,
  contentChild,
  input,
  InputSignal,
  InputSignalWithTransform,
  model,
  ModelSignal,
  Signal,
  TemplateRef,
  viewChild,
} from '@angular/core';
import { accordionHeadingLevel } from '../accordion.types';

/**
 * One collapsible section, declared as content of a `tls-accordion`. The host
 * element itself is never rendered: the accordion reads the captured
 * content/header templates and renders them inside its own trigger/panel
 * structure, which is what allows the panel content to be deferred until the
 * section is first expanded.
 *
 * The default header renders `label` above an optional `description`. Two
 * template slots override it: `#accordionItemHeader` replaces that text
 * entirely, and `#accordionItemTrailing` renders between the header and the
 * chevron.
 */
@Component({
  selector: 'tls-accordion-item',
  templateUrl: './accordion-item.html',
})
export class AccordionItem {
  // Inputs
  /**
   * Text of the heading. Required even alongside a header template, which
   * renders in its place but leaves the label as the section's accessible name
   * — a header composed only of an icon would otherwise have none.
   */
  public readonly label: InputSignal<string> = input.required<string>();
  /** Secondary line rendered under the label. */
  public readonly description: InputSignal<string | undefined> = input<string>();
  public readonly disabled: InputSignalWithTransform<boolean, unknown> = input<boolean, unknown>(
    false,
    { transform: booleanAttribute },
  );
  /** Overrides the heading rank the accordion assigns to its items. */
  public readonly headingLevel: InputSignal<accordionHeadingLevel | undefined> =
    input<accordionHeadingLevel>();
  public readonly expanded: ModelSignal<boolean> = model<boolean>(false);

  // State
  public readonly headerTemplateRef: Signal<TemplateRef<unknown> | undefined> =
    contentChild<TemplateRef<unknown>>('accordionItemHeader');
  public readonly trailingTemplateRef: Signal<TemplateRef<unknown> | undefined> =
    contentChild<TemplateRef<unknown>>('accordionItemTrailing');
  public readonly contentTemplateRef: Signal<TemplateRef<unknown>> =
    viewChild.required<TemplateRef<unknown>>('accordionItemContent');
}
