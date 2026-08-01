import {
  booleanAttribute,
  Component,
  contentChild,
  input,
  InputSignal,
  InputSignalWithTransform,
  Signal,
  TemplateRef,
  viewChild,
} from '@angular/core';
import { tabValue } from '../tabs.types';

// A declarative content holder: the host element itself is never rendered. `tls-tabs`
// reads the captured content/header templates and renders them inside its own
// `ngTabPanel`/`ngTabContent` structure, which enables lazy panel rendering.
@Component({
  selector: 'tls-tab',
  templateUrl: './tab.html',
})
export class Tab {
  // Inputs
  public readonly value: InputSignal<tabValue> = input.required<tabValue>();
  public readonly label: InputSignal<string> = input.required<string>();
  public readonly disabled: InputSignalWithTransform<boolean, unknown> = input<boolean, unknown>(
    false,
    { transform: booleanAttribute },
  );

  // State
  public readonly headerTemplateRef: Signal<TemplateRef<unknown> | undefined> =
    contentChild<TemplateRef<unknown>>('tabHeader');
  public readonly contentTemplateRef: Signal<TemplateRef<unknown>> =
    viewChild.required<TemplateRef<unknown>>('tabContent');
}
