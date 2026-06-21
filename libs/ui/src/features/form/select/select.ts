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
  WritableSignal,
} from '@angular/core';
import { createOverlayManager } from '../../../abstract/overlay';
import {
  FORM_CONTROL,
  normalizeOptions,
  Option,
  optionInput,
  ValueFormControl,
} from '../../../abstract/form';
import { controlSize } from '../../../types';
import { SELECT_CONFIG } from './select.token';

@Component({
  selector: 'tls-select',
  templateUrl: './select.html',
  host: {
    '[class]': 'hostClasses()',
  },
  providers: [{ provide: FORM_CONTROL, useExisting: forwardRef(() => Select) }],
})
export class Select<T, V = unknown> extends ValueFormControl<V | null> {
  private readonly _config = inject(SELECT_CONFIG);
  private readonly _overlay = createOverlayManager();

  private readonly _triggerElement = viewChild<ElementRef<HTMLButtonElement>>('trigger');
  private readonly _panelTemplate = viewChild<TemplateRef<void>>('panel');

  public readonly value: ModelSignal<V | null> = model<V | null>(null);
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

  protected readonly isOpen: Signal<boolean> = this._overlay.isOpen;
  protected readonly activeIndex: WritableSignal<number> = signal(-1);

  protected readonly normalizedOptions: Signal<Option<V>[]> = computed(() =>
    normalizeOptions<T, V>(this.options(), {
      label: this.optionLabel(),
      value: this.optionValue(),
      disabled: this.optionDisabled(),
    }),
  );

  protected readonly hasValue: Signal<boolean> = computed(() => {
    const value = this.value();
    return value !== null && value !== undefined && value !== '';
  });

  protected readonly selectedLabel: Signal<string> = computed(() => {
    if (!this.hasValue()) return '';
    return this.normalizedOptions().find(option => option.value === this.value())?.label ?? '';
  });

  // Classes
  protected readonly hostClasses: Signal<string[]> = computed(() => {
    const array: string[] = ['tls-select'];

    if (this.isOpen()) array.push('tls-select--open');
    array.push(`${this.CLASS_NAME}--${this.size()}`);
    if (this.fluid()) array.push(`${this.CLASS_NAME}--fluid`);

    return array.concat(this.controlClasses());
  });

  // Protected methods
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
      panelClass: 'tls-select-panel',
      // Select handles Escape itself via the trigger's keydown handler.
      closeOnEscape: false,
      minWidth: triggerElement.nativeElement.offsetWidth,
      reuse: true,
      onClose: () => {
        this.activeIndex.set(-1);
        this._triggerElement()?.nativeElement.focus();
      },
    });

    this.activeIndex.set(
      this.normalizedOptions().findIndex(option => option.value === this.value()),
    );
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

  protected select(option: Option<V>): void {
    if (option.disabled) return;
    this.value.set(option.value);
    this.close();
  }

  protected clear(): void {
    this.value.set(null);
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
      if (active && !active.disabled) this.select(active);
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
}
