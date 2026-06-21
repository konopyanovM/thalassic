import {
  booleanAttribute,
  Component,
  computed,
  ElementRef,
  forwardRef,
  inject,
  input,
  InputSignal,
  InputSignalWithTransform,
  model,
  ModelSignal,
  Signal,
  signal,
  TemplateRef,
  viewChild,
  WritableSignal
} from '@angular/core';
import { createOverlayManager } from '../../../abstract/overlay';
import { FORM_CONTROL, normalizeOptions, Option, optionInput, ValueFormControl } from '../../../abstract/form';
import { controlSize } from '../../../types';
import { MULTI_SELECT_CONFIG } from './multi-select.token';

@Component({
  selector: 'tls-multi-select',
  templateUrl: './multi-select.html',
  host: {
    '[class]': 'hostClasses()',
  },
  providers: [{ provide: FORM_CONTROL, useExisting: forwardRef(() => MultiSelect) }],
})
export class MultiSelect<T, V = unknown> extends ValueFormControl<V[]> {
  private static _nextUniqueId = 0;

  private readonly _config = inject(MULTI_SELECT_CONFIG);
  private readonly _overlay = createOverlayManager();

  private readonly _uniqueId = `tls-multi-select-${MultiSelect._nextUniqueId++}`;
  protected readonly listboxId = `${this._uniqueId}-listbox`;

  private readonly _triggerElement = viewChild<ElementRef<HTMLButtonElement>>('trigger');
  private readonly _panelTemplate = viewChild<TemplateRef<void>>('panel');

  public readonly value: ModelSignal<V[]> = model<V[]>([]);
  public readonly inputId = input<string | null>(null);
  public readonly options: InputSignal<optionInput<T>[]> = input<optionInput<T>[]>([]);
  public readonly optionLabel = input<keyof T | undefined>(undefined);
  public readonly optionValue = input<keyof T | undefined>(undefined);
  public readonly optionDisabled = input<keyof T | undefined>(undefined);
  public readonly placeholder = input<string>(this._config.placeholder);
  public readonly size: InputSignal<controlSize> = input<controlSize>(this._config.size);
  public readonly fluid: InputSignalWithTransform<boolean, unknown> = input<boolean, unknown>(
    this._config.fluid,
    { transform: booleanAttribute },
  );
  public readonly tabindex = input<string | number>(0);
  public readonly clearable: InputSignalWithTransform<boolean, unknown> = input<boolean, unknown>(
    this._config.clearable,
    { transform: booleanAttribute },
  );
  public readonly maxLabels = input<number>(this._config.maxLabels);

  protected readonly isOpen: Signal<boolean> = this._overlay.isOpen;
  protected readonly activeIndex: WritableSignal<number> = signal(-1);

  protected readonly normalizedOptions: Signal<Option<V>[]> = computed(() =>
    normalizeOptions<T, V>(this.options(), {
      label: this.optionLabel(),
      value: this.optionValue(),
      disabled: this.optionDisabled(),
    }),
  );

  protected readonly hasValue: Signal<boolean> = computed(() => this.value().length > 0);

  protected readonly selectedValues: Signal<Set<V>> = computed(() => new Set(this.value()));

  protected readonly triggerLabel: Signal<string> = computed(() => {
    const selected = this.value();
    if (selected.length === 0) return '';

    const max = this.maxLabels();
    if (selected.length > max) return `${selected.length} selected`;

    const optionMap = new Map(this.normalizedOptions().map(option => [option.value, option.label]));
    return selected.map(value => optionMap.get(value) ?? String(value)).join(', ');
  });

  protected readonly initialActiveIndex: Signal<number> = computed(() => {
    const options = this.normalizedOptions();
    const selected = this.selectedValues();

    const firstSelected = options.findIndex(
      option => !option.disabled && selected.has(option.value),
    );
    if (firstSelected !== -1) return firstSelected;

    return options.findIndex(option => !option.disabled);
  });

  protected readonly activeDescendantId: Signal<string | null> = computed(() => {
    const index = this.activeIndex();
    if (index < 0) return null;
    return this.optionId(index);
  });

  protected readonly hostClasses: Signal<string[]> = computed(() => {
    const array: string[] = ['tls-multi-select'];

    if (this.isOpen()) array.push('tls-multi-select--open');
    array.push(`${this.CLASS_NAME}--${this.size()}`);
    if (this.fluid()) array.push(`${this.CLASS_NAME}--fluid`);

    return array.concat(this.controlClasses());
  });

  protected open(): void {
    const triggerElement = this._triggerElement();
    const panelTemplate = this._panelTemplate();
    if (this.notInteractive() || this.isOpen() || !triggerElement || !panelTemplate) return;

    this._overlay.open({
      content: panelTemplate,
      origin: triggerElement,
      positions: [
        { originX: 'start', originY: 'bottom', overlayX: 'start', overlayY: 'top', offsetY: 4 },
        { originX: 'start', originY: 'top', overlayX: 'start', overlayY: 'bottom', offsetY: -4 },
      ],
      flexibleDimensions: false,
      push: false,
      panelClass: 'tls-multi-select-panel',
      closeOnEscape: false,
      minWidth: triggerElement.nativeElement.offsetWidth,
      reuse: true,
      onClose: () => {
        this.activeIndex.set(-1);
        const trigger = this._triggerElement();
        if (trigger) trigger.nativeElement.focus();
      },
    });

    this.activeIndex.set(this.initialActiveIndex());
  }

  protected close(): void {
    this._overlay.close();
  }

  protected toggle(): void {
    if (this.isOpen()) {
      this.close();
    } else {
      this.open();
    }
  }

  protected isSelected(option: Option<V>): boolean {
    return this.selectedValues().has(option.value);
  }

  protected toggleOption(option: Option<V>): void {
    if (option.disabled) return;
    if (this.isSelected(option)) {
      this.value.update(current => current.filter(item => item !== option.value));
    } else {
      this.value.update(current => [...current, option.value]);
    }
  }

  protected clear(): void {
    this.value.set([]);
  }

  protected onOptionHover(index: number, disabled?: boolean): void {
    if (!disabled) this.activeIndex.set(index);
  }

  protected onKeydown(event: KeyboardEvent): void {
    if (event.key === 'ArrowDown') {
      event.preventDefault();
      if (this.isOpen()) {
        this._moveActive(1);
      } else {
        this.open();
      }
    } else if (event.key === 'ArrowUp') {
      event.preventDefault();
      if (this.isOpen()) {
        this._moveActive(-1);
      } else {
        this.open();
      }
    } else if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      if (!this.isOpen()) {
        this.open();
        return;
      }
      const active = this.normalizedOptions()[this.activeIndex()];
      if (active && !active.disabled) this.toggleOption(active);
    } else if (event.key === 'Home') {
      if (!this.isOpen()) return;
      event.preventDefault();
      this._moveActiveToEdge(1);
    } else if (event.key === 'End') {
      if (!this.isOpen()) return;
      event.preventDefault();
      this._moveActiveToEdge(-1);
    } else if (event.key === 'Escape') {
      event.preventDefault();
      if (this.isOpen()) this.close();
    } else if (event.key === 'Tab') {
      if (this.isOpen()) this.close();
    } else if (
      (event.key === 'Delete' || event.key === 'Backspace') &&
      this.clearable() &&
      this.hasValue()
    ) {
      event.preventDefault();
      this.clear();
    }
  }

  protected optionId(index: number): string {
    return `${this._uniqueId}-option-${index}`;
  }

  // Private methods
  private _moveActive(direction: 1 | -1): void {
    const options = this.normalizedOptions();
    let next = this.activeIndex() + direction;

    while (next >= 0 && next < options.length) {
      if (!options[next].disabled) {
        this.activeIndex.set(next);
        return;
      }
      next += direction;
    }
  }

  private _moveActiveToEdge(direction: 1 | -1): void {
    const options = this.normalizedOptions();
    let next = direction === 1 ? 0 : options.length - 1;

    while (next >= 0 && next < options.length) {
      if (!options[next].disabled) {
        this.activeIndex.set(next);
        return;
      }
      next += direction;
    }
  }
}
