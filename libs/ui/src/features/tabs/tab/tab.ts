import {
  booleanAttribute,
  Component,
  computed,
  contentChild,
  inject,
  input,
  InputSignal,
  InputSignalWithTransform,
  Signal,
  TemplateRef,
} from '@angular/core';
import { TabPanel } from '@angular/aria/tabs';
import { tabValue } from '../tabs.types';

@Component({
  selector: 'tls-tab',
  imports: [],
  templateUrl: './tab.html',
  // Content is projected eagerly (no `ngTabContent`) to keep `<tls-tab>content</tls-tab>`
  // as a plain content-projecting API. This makes TabPanel log a dev-mode-only
  // "must have an ngTabContent" diagnostic, which is expected and harmless here.
  hostDirectives: [{ directive: TabPanel, inputs: ['value'] }],
  host: {
    '[class]': 'hostClasses()',
  },
})
export class Tab {
  private readonly _tabPanel = inject(TabPanel);

  public readonly headerTemplateRef = contentChild<TemplateRef<unknown>>('tabHeader');

  // Inputs
  public readonly value: Signal<tabValue> = this._tabPanel.value;
  public readonly label: InputSignal<string> = input.required<string>();
  public readonly disabled: InputSignalWithTransform<boolean, unknown> = input<boolean, unknown>(
    false,
    { transform: booleanAttribute },
  );

  protected hostClasses = computed(() => {
    const className = 'tls-tab';

    const array: string[] = [className];

    if (this._tabPanel.visible()) array.push(`${className}--active`);
    if (this.disabled()) array.push(`${className}--disabled`);

    return array;
  });
}
