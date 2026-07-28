import {
  booleanAttribute,
  Component,
  computed,
  ElementRef,
  inject,
  input,
  InputSignalWithTransform,
  model,
  ModelSignal,
  numberAttribute,
} from '@angular/core';

let nextPanelId = 0;

@Component({
  selector: 'tls-splitter-panel',
  imports: [],
  template: '<ng-content></ng-content>',
  host: {
    '[class]': 'hostClasses()',
    '[id]': 'id',
    // Panels are weighted flex items: `size` acts as the grow weight while
    // `flex-basis: 0` lets the weights fully partition the container.
    '[style.flex-grow]': 'resolvedSize()',
    '[style.flex-basis.%]': '0',
    '[style.flex-shrink]': '1',
  },
})
export class SplitterPanel {
  // Injections
  private readonly _elementRef = inject<ElementRef<HTMLElement>>(ElementRef);

  // State
  public readonly id = `tls-splitter-panel-${nextPanelId++}`;

  // Inputs
  /**
   * Current size of the panel as a percentage of the splitter. Two-way bound so
   * the owning splitter can update it during a resize and consumers can persist
   * the resulting layout. `null` requests an auto share of the remaining space.
   */
  public readonly size: ModelSignal<number | null> = model<number | null>(null);
  public readonly min: InputSignalWithTransform<number, unknown> = input(0, {
    transform: numberAttribute,
  });
  public readonly max: InputSignalWithTransform<number, unknown> = input(100, {
    transform: numberAttribute,
  });
  public readonly collapsible: InputSignalWithTransform<boolean, unknown> = input(false, {
    transform: booleanAttribute,
  });
  public readonly collapsed: ModelSignal<boolean> = model<boolean>(false);

  // Computed
  protected readonly resolvedSize = computed(() => this.size() ?? 0);

  protected readonly hostClasses = computed(() => {
    const className = 'tls-splitter-panel';

    const array: string[] = [className];

    if (this.collapsed()) array.push(`${className}--collapsed`);

    return array;
  });

  // Accessors
  public get element(): HTMLElement {
    return this._elementRef.nativeElement;
  }
}
