import { Overlay, OverlayRef } from '@angular/cdk/overlay';
import { TemplatePortal } from '@angular/cdk/portal';
import {
  booleanAttribute,
  Component,
  computed,
  DestroyRef,
  ElementRef,
  forwardRef,
  inject,
  input,
  InputSignal,
  InputSignalWithTransform,
  model,
  ModelSignal,
  OnDestroy,
  Signal,
  signal,
  TemplateRef,
  viewChild,
  ViewContainerRef,
  WritableSignal,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FORM_CONTROL, ValueFormControl } from '../../../abstract/form';
import { SELECT_CONFIG } from './select.token';
import { selectOptionType, selectSize } from './select.types';

interface NormalizedOption {
  value: unknown;
  label: string;
  disabled: boolean;
}

@Component({
  selector: 'tls-select',
  templateUrl: './select.html',
  styleUrl: './select.scss',
  host: {
    '[class]': 'hostClasses()',
  },
  providers: [{ provide: FORM_CONTROL, useExisting: forwardRef(() => Select) }],
})
export class Select<T> extends ValueFormControl<unknown> implements OnDestroy {
  private readonly _config = inject(SELECT_CONFIG);
  private readonly _overlay = inject(Overlay);
  private readonly _elementRef = inject(ElementRef);
  private readonly _viewContainerRef = inject(ViewContainerRef);
  private readonly _destroyRef = inject(DestroyRef);

  private readonly _triggerElement = viewChild<ElementRef<HTMLButtonElement>>('trigger');
  private readonly _panelTemplate = viewChild<TemplateRef<void>>('panel');

  private _overlayRef: OverlayRef | null = null;
  private _portal: TemplatePortal | null = null;

  public readonly value: ModelSignal<unknown> = model<unknown>(undefined);
  public readonly inputId = input<string | null>(null);
  public readonly options: InputSignal<selectOptionType<T>[]> = input<selectOptionType<T>[]>([]);
  public readonly optionLabel = input<keyof T | undefined>(undefined);
  public readonly optionValue = input<keyof T | undefined>(undefined);
  public readonly optionDisabled = input<keyof T | undefined>(undefined);
  public readonly placeholder = input<string>(this._config.placeholder);
  public readonly size: InputSignal<selectSize> = input<selectSize>(this._config.size);
  public readonly fluid: InputSignalWithTransform<boolean, unknown> = input<boolean, unknown>(
    this._config.fluid,
    { transform: booleanAttribute },
  );
  public readonly tabindex = input<string | number>(0);
  public readonly clearable: InputSignalWithTransform<boolean, unknown> = input<boolean, unknown>(
    this._config.clearable,
    { transform: booleanAttribute },
  );

  protected readonly isOpen: WritableSignal<boolean> = signal(false);
  protected readonly activeIndex: WritableSignal<number> = signal(-1);

  protected readonly normalizedOptions: Signal<NormalizedOption[]> = computed(() => {
    const options = this.options();
    const optionLabel = this.optionLabel();
    const optionValue = this.optionValue();
    const optionDisabled = this.optionDisabled();

    return options.map(option => {
      if (typeof option === 'string' || typeof option === 'number') {
        return { value: option, label: String(option), disabled: false };
      }

      const typedOption = option as T;

      return {
        value: optionValue ? typedOption[optionValue] : typedOption,
        label: String(optionLabel ? typedOption[optionLabel] : typedOption),
        disabled: Boolean(optionDisabled ? typedOption[optionDisabled] : false),
      };
    });
  });

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
    const selectClass = 'tls-select';
    const formControlClass = 'tls-form-control';

    const array: string[] = [selectClass];

    if (this.isOpen()) array.push(`${selectClass}--open`);
    array.push(`${formControlClass}--${this.size()}`);
    if (this.fluid()) array.push(`${formControlClass}--fluid`);

    return array.concat(this.controlClasses());
  });

  // Protected methods
  protected open(): void {
    const triggerElement = this._triggerElement();
    const panelTemplate = this._panelTemplate();
    if (this.notInteractive() || this.isOpen() || !triggerElement || !panelTemplate) return;

    if (!this._overlayRef) {
      this._overlayRef = this._overlay.create({
        positionStrategy: this._overlay
          .position()
          .flexibleConnectedTo(this._elementRef)
          .withPositions([
            { originX: 'start', originY: 'bottom', overlayX: 'start', overlayY: 'top', offsetY: 4 },
            {
              originX: 'start',
              originY: 'top',
              overlayX: 'start',
              overlayY: 'bottom',
              offsetY: -4,
            },
          ])
          .withFlexibleDimensions(false)
          .withPush(false),
        scrollStrategy: this._overlay.scrollStrategies.reposition(),
        hasBackdrop: true,
        panelClass: 'tls-select-panel',
        backdropClass: 'cdk-overlay-transparent-backdrop',
      });

      this._overlayRef
        .backdropClick()
        .pipe(takeUntilDestroyed(this._destroyRef))
        .subscribe(() => this.close());
    }

    this._portal ??= new TemplatePortal(panelTemplate, this._viewContainerRef);
    this._overlayRef.updateSize({ minWidth: this._elementRef.nativeElement.offsetWidth });
    this._overlayRef.attach(this._portal);

    this.isOpen.set(true);
    this.activeIndex.set(
      this.normalizedOptions().findIndex(option => option.value === this.value()),
    );
  }

  protected close(): void {
    this._overlayRef?.detach();
    this.isOpen.set(false);
    this.activeIndex.set(-1);
    this._triggerElement()?.nativeElement.focus();
  }

  protected toggle(): void {
    if (this.isOpen()) {
      this.close();
    } else {
      this.open();
    }
  }

  protected select(option: NormalizedOption): void {
    if (option.disabled) return;
    this.value.set(option.value);
    this.close();
  }

  protected clear(): void {
    this.value.set(undefined);
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

  // Lifecycle
  ngOnDestroy(): void {
    if (this._overlayRef) this._overlayRef.dispose();
  }
}
