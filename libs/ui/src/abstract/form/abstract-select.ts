import {
  computed,
  contentChild,
  Directive,
  ElementRef,
  input,
  InputSignal,
  InputSignalWithTransform,
  Signal,
  signal,
  TemplateRef,
  viewChild,
  WritableSignal,
} from '@angular/core';
import { createOverlayManager } from '../overlay';
import { selectTemplateContext } from './abstract-select.types';
import { normalizeOptions, Option, optionInput } from './options';
import { ValueFormControl } from './value-form-control';
import { controlSize } from '../../types';

/**
 * Shared base for the single {@link Select} and {@link MultiSelect} controls.
 * Owns everything the two listbox-combobox controls have in common: the option
 * inputs, the connected overlay lifecycle, roving `aria-activedescendant`
 * navigation, and the keyboard handler. The per-control differences (the value
 * shape, the selected-state check, how the trigger label is built and what a
 * commit does) are expressed through the abstract members below.
 */
@Directive()
export abstract class AbstractSelect<T, V, ValueType> extends ValueFormControl<ValueType> {
  protected readonly overlay = createOverlayManager();

  private readonly triggerElement = viewChild<ElementRef<HTMLElement>>('trigger');
  private readonly panelTemplate = viewChild<TemplateRef<void>>('panel');

  /**
   * Consumer template rendered inside each option button in place of the plain
   * label (`<ng-template #option let-context>`). The button itself — and with it
   * the option's ARIA, activation, and hover behavior — stays owned by the
   * control; the template only customizes the visual content.
   */
  protected readonly optionTemplate =
    contentChild<TemplateRef<selectTemplateContext<T, V>>>('option');

  // Shared inputs (config-independent)
  public readonly options: InputSignal<optionInput<T>[]> = input<optionInput<T>[]>([]);
  public readonly optionLabel = input<keyof T | undefined>(undefined);
  public readonly optionValue = input<keyof T | undefined>(undefined);
  public readonly optionDisabled = input<keyof T | undefined>(undefined);
  public readonly tabindex = input<string | number>(0);

  // Config-defaulted inputs are declared by each concrete control.
  public abstract readonly placeholder: InputSignal<string>;
  public abstract readonly size: InputSignal<controlSize>;
  public abstract readonly fluid: InputSignalWithTransform<boolean, unknown>;
  public abstract readonly clearable: InputSignalWithTransform<boolean, unknown>;

  protected readonly isOpen: Signal<boolean> = this.overlay.isOpen;
  protected readonly activeIndex: WritableSignal<number> = signal(-1);

  protected readonly normalizedOptions: Signal<Option<V>[]> = computed(() =>
    normalizeOptions<T, V>(this.options(), {
      label: this.optionLabel(),
      value: this.optionValue(),
      disabled: this.optionDisabled(),
    }),
  );

  /**
   * Options actually shown in the panel and traversed by keyboard navigation. Defaults to the full
   * normalized list; a filtering control (an editable combobox) narrows it via
   * {@link filterVisibleOptions}. `activeIndex` always indexes into this list, never the raw one.
   */
  protected readonly visibleOptions: Signal<Option<V>[]> = computed(() =>
    this.filterVisibleOptions(this.normalizedOptions()),
  );

  protected readonly activeDescendantId: Signal<string | null> = computed(() => {
    const index = this.activeIndex();
    if (index < 0) return null;
    return this.optionId(index);
  });

  protected readonly hostClasses: Signal<string[]> = computed(() => {
    const array: string[] = [this.hostClassBase];

    if (this.isOpen()) array.push(`${this.hostClassBase}--open`);
    array.push(`${this.CLASS_NAME}--${this.size()}`);
    if (this.fluid()) array.push(`${this.CLASS_NAME}--fluid`);

    return array.concat(this.controlClasses());
  });

  protected get listboxId(): string {
    return `${this.uniqueId}-listbox`;
  }

  // Per-control hooks
  protected abstract readonly uniqueId: string;
  protected abstract readonly hostClassBase: string;
  protected abstract readonly panelClass: string;
  protected abstract readonly hasValue: Signal<boolean>;
  /** Whether `option` is part of the current selection (scalar or array, per control). */
  protected abstract isOptionSelected(option: Option<V>): boolean;
  /** Index the active option starts on when the panel opens. */
  protected abstract getInitialActiveIndex(): number;
  /** Apply the active option's selection when committed via mouse or keyboard. */
  protected abstract commitActiveOption(option: Option<V>): void;
  /** Reset the control to its empty value. */
  protected abstract clear(): void;

  /**
   * Narrows the option list shown in the panel. The listbox controls show every option; an editable
   * combobox overrides this to filter by the typed query.
   */
  protected filterVisibleOptions(options: Option<V>[]): Option<V>[] {
    return options;
  }

  /** Hook invoked after the panel has closed, once the trigger has regained focus. */
  protected onClosed(): void {
    // No-op by default; an editable combobox overrides this to reconcile its text.
  }

  // Protected methods
  protected open(): void {
    const triggerElement = this.triggerElement();
    const panelTemplate = this.panelTemplate();
    if (this.notInteractive() || this.isOpen() || !triggerElement || !panelTemplate) return;

    this.overlay.open({
      content: panelTemplate,
      origin: triggerElement,
      positions: [
        { originX: 'start', originY: 'bottom', overlayX: 'start', overlayY: 'top', offsetY: 4 },
        { originX: 'start', originY: 'top', overlayX: 'start', overlayY: 'bottom', offsetY: -4 },
      ],
      flexibleDimensions: false,
      push: false,
      panelClass: this.panelClass,
      // The control handles Escape itself via the trigger's keydown handler.
      closeOnEscape: false,
      minWidth: triggerElement.nativeElement.offsetWidth,
      reuse: true,
      onClose: () => {
        this.activeIndex.set(-1);
        const trigger = this.triggerElement();
        if (trigger) trigger.nativeElement.focus();
        this.onClosed();
      },
    });

    this.activeIndex.set(this.getInitialActiveIndex());
  }

  protected close(): void {
    this.overlay.close();
  }

  protected toggle(): void {
    if (this.isOpen()) {
      this.close();
    } else {
      this.open();
    }
  }

  protected onOptionHover(event: PointerEvent, index: number, disabled?: boolean): void {
    // A touch "enter" is a tap in progress, not a hover; the click that follows
    // commits the option, so the active index has nothing to track.
    if (event.pointerType === 'touch') return;
    if (!disabled) this.activeIndex.set(index);
  }

  protected onKeydown(event: KeyboardEvent): void {
    if (event.key === 'ArrowDown') {
      event.preventDefault();
      if (this.isOpen()) {
        this.moveActive(1);
      } else {
        this.open();
      }
    } else if (event.key === 'ArrowUp') {
      event.preventDefault();
      if (this.isOpen()) {
        this.moveActive(-1);
      } else {
        this.open();
      }
    } else if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      if (!this.isOpen()) {
        this.open();
        return;
      }
      const active = this.visibleOptions()[this.activeIndex()];
      if (active && !active.disabled) this.commitActiveOption(active);
    } else if (event.key === 'Home') {
      if (!this.isOpen()) return;
      event.preventDefault();
      this.moveActiveToEdge(1);
    } else if (event.key === 'End') {
      if (!this.isOpen()) return;
      event.preventDefault();
      this.moveActiveToEdge(-1);
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
    return `${this.uniqueId}-option-${index}`;
  }

  /** Context handed to the consumer's option template for the option at `index`. */
  protected optionContext(option: Option<V>, index: number): selectTemplateContext<T, V> {
    return {
      $implicit: {
        option: option.source as T,
        value: option.value,
        label: option.label,
        index,
        selected: this.isOptionSelected(option),
        active: index === this.activeIndex(),
        disabled: option.disabled,
      },
    };
  }

  protected moveActive(direction: 1 | -1): void {
    const options = this.visibleOptions();
    let next = this.activeIndex() + direction;

    while (next >= 0 && next < options.length) {
      if (!options[next].disabled) {
        this.activeIndex.set(next);
        return;
      }
      next += direction;
    }
  }

  // Private methods
  private moveActiveToEdge(direction: 1 | -1): void {
    const options = this.visibleOptions();
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

