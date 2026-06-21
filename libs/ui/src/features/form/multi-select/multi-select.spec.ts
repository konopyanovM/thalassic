import { OverlayContainer } from '@angular/cdk/overlay';
import { Component, signal, viewChild } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MultiSelect } from './multi-select';

interface Option {
  label: string;
  value: number;
  disabled: boolean;
}

@Component({
  imports: [MultiSelect],
  template: `
    <tls-multi-select
      [options]="options()"
      [value]="value()"
      [clearable]="clearable()"
      [disabled]="disabled()"
      [maxLabels]="maxLabels()"
      optionLabel="label"
      optionValue="value"
      optionDisabled="disabled"
    />
  `,
})
class HostComponent {
  public readonly options = signal<Option[]>([
    { label: 'One', value: 1, disabled: false },
    { label: 'Two', value: 2, disabled: true },
    { label: 'Three', value: 3, disabled: false },
  ]);
  public readonly value = signal<number[]>([]);
  public readonly clearable = signal(false);
  public readonly disabled = signal(false);
  public readonly maxLabels = signal(2);
  public readonly multiSelect = viewChild.required(MultiSelect);
}

describe('MultiSelect', () => {
  let fixture: ComponentFixture<HostComponent>;
  let host: HostComponent;
  let trigger: HTMLButtonElement;
  let overlayContainer: OverlayContainer;
  let overlayContainerElement: HTMLElement;

  const selectedValue = () => host.multiSelect().value();
  const queryPanel = () =>
    overlayContainerElement.querySelector<HTMLElement>('.tls-multi-select__panel');
  const queryOptions = () =>
    Array.from(
      overlayContainerElement.querySelectorAll<HTMLButtonElement>(
        '.tls-multi-select__option-button',
      ),
    );
  const queryActiveOption = () =>
    overlayContainerElement.querySelector<HTMLElement>('.tls-multi-select__option--active');
  const queryBackdrop = () =>
    overlayContainerElement.querySelector<HTMLElement>('.cdk-overlay-backdrop');
  const queryClear = () =>
    (fixture.nativeElement as HTMLElement).querySelector<HTMLButtonElement>(
      '.tls-multi-select__clear',
    );
  const queryTriggerValue = () =>
    (fixture.nativeElement as HTMLElement).querySelector<HTMLElement>(
      '.tls-multi-select__value',
    );
  const keydown = (key: string) => {
    trigger.dispatchEvent(new KeyboardEvent('keydown', { key, bubbles: true }));
    fixture.detectChanges();
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HostComponent],
    }).compileComponents();

    overlayContainer = TestBed.inject(OverlayContainer);
    overlayContainerElement = overlayContainer.getContainerElement();

    fixture = TestBed.createComponent(HostComponent);
    host = fixture.componentInstance;
    fixture.detectChanges();
    await fixture.whenStable();

    trigger = fixture.nativeElement.querySelector('.tls-multi-select__trigger');
  });

  afterEach(() => {
    overlayContainer.ngOnDestroy();
  });

  it('should create', () => {
    expect(host.multiSelect()).toBeTruthy();
  });

  it('should start closed', () => {
    expect(queryPanel()).toBeNull();
    expect(fixture.nativeElement.querySelector('.tls-multi-select--open')).toBeNull();
  });

  describe('open / close via trigger', () => {
    it('should open the panel on trigger click and mark the host open', () => {
      trigger.click();
      fixture.detectChanges();

      expect(queryPanel()).not.toBeNull();
      expect(fixture.nativeElement.querySelector('.tls-multi-select--open')).not.toBeNull();
      expect(trigger.getAttribute('aria-expanded')).toBe('true');
    });

    it('should render one option button per normalized option', () => {
      trigger.click();
      fixture.detectChanges();

      const options = queryOptions();
      expect(options.length).toBe(3);
      expect(options[0].textContent?.trim()).toBe('One');
    });

    it('should close on a second trigger click (toggle) and refocus the trigger', () => {
      trigger.click();
      fixture.detectChanges();
      trigger.click();
      fixture.detectChanges();

      expect(queryPanel()).toBeNull();
      expect(document.activeElement).toBe(trigger);
    });

    it('should close on backdrop click', () => {
      trigger.click();
      fixture.detectChanges();

      queryBackdrop()?.click();
      fixture.detectChanges();

      expect(queryPanel()).toBeNull();
    });

    it('should not open when disabled', () => {
      host.disabled.set(true);
      fixture.detectChanges();

      keydown('ArrowDown');

      expect(queryPanel()).toBeNull();
    });
  });

  describe('selection', () => {
    it('should add a value when an option is clicked and keep the panel open', () => {
      trigger.click();
      fixture.detectChanges();

      queryOptions()[0].click();
      fixture.detectChanges();

      expect(selectedValue()).toEqual([1]);
      expect(queryPanel()).not.toBeNull();
    });

    it('should toggle off a value when a selected option is clicked again', () => {
      host.value.set([1]);
      fixture.detectChanges();

      trigger.click();
      fixture.detectChanges();

      queryOptions()[0].click();
      fixture.detectChanges();

      expect(selectedValue()).toEqual([]);
    });

    it('should accumulate multiple selected values', () => {
      trigger.click();
      fixture.detectChanges();

      queryOptions()[0].click();
      fixture.detectChanges();
      queryOptions()[2].click();
      fixture.detectChanges();

      expect(selectedValue()).toEqual([1, 3]);
    });

    it('should ignore clicks on disabled options', () => {
      trigger.click();
      fixture.detectChanges();

      queryOptions()[1].click();
      fixture.detectChanges();

      expect(selectedValue()).toEqual([]);
      expect(queryPanel()).not.toBeNull();
    });

    it('should mark selected options with aria-selected', () => {
      host.value.set([1]);
      fixture.detectChanges();

      trigger.click();
      fixture.detectChanges();

      const options = queryOptions();
      expect(options[0].getAttribute('aria-selected')).toBe('true');
      expect(options[2].getAttribute('aria-selected')).toBe('false');
    });
  });

  describe('trigger label', () => {
    it('should show comma-joined labels when selection is within maxLabels', () => {
      host.value.set([1, 3]);
      fixture.detectChanges();

      expect(queryTriggerValue()?.textContent?.trim()).toBe('One, Three');
    });

    it('should show "N selected" when selection exceeds maxLabels', () => {
      host.maxLabels.set(1);
      host.value.set([1, 3]);
      fixture.detectChanges();

      expect(queryTriggerValue()?.textContent?.trim()).toBe('2 selected');
    });
  });

  describe('clear', () => {
    it('should show a clear button only when clearable and values are set', () => {
      host.clearable.set(true);
      fixture.detectChanges();
      expect(queryClear()).toBeNull();

      host.value.set([1]);
      fixture.detectChanges();
      expect(queryClear()).not.toBeNull();
    });

    it('should reset the value to an empty array when the clear button is clicked', () => {
      host.clearable.set(true);
      host.value.set([1, 3]);
      fixture.detectChanges();

      queryClear()?.click();
      fixture.detectChanges();

      expect(selectedValue()).toEqual([]);
    });
  });

  describe('keyboard', () => {
    it('should open on ArrowDown when closed', () => {
      keydown('ArrowDown');
      expect(queryPanel()).not.toBeNull();
    });

    it('should open on ArrowUp when closed', () => {
      keydown('ArrowUp');
      expect(queryPanel()).not.toBeNull();
    });

    it('should move active down skipping disabled options', () => {
      keydown('ArrowDown'); // opens, active = 0
      expect(queryActiveOption()?.textContent?.trim()).toBe('One');

      keydown('ArrowDown'); // skips disabled "Two" -> index 2 (Three)
      expect(queryActiveOption()?.textContent?.trim()).toBe('Three');
    });

    it('should move active to the last enabled option on End', () => {
      keydown('ArrowDown'); // opens, active = 0 (One)
      keydown('End');
      expect(queryActiveOption()?.textContent?.trim()).toBe('Three');
    });

    it('should move active to the first enabled option on Home', () => {
      keydown('ArrowDown'); // opens, active = 0
      keydown('End'); // -> Three
      keydown('Home');
      expect(queryActiveOption()?.textContent?.trim()).toBe('One');
    });

    it('should toggle the active option on Enter without closing', () => {
      keydown('ArrowDown'); // opens, active = 0
      keydown('Enter');

      expect(selectedValue()).toEqual([1]);
      expect(queryPanel()).not.toBeNull();
    });

    it('should close on Escape', () => {
      keydown('ArrowDown'); // opens
      keydown('Escape');
      expect(queryPanel()).toBeNull();
    });

    it('should close on Tab', () => {
      keydown('ArrowDown'); // opens
      keydown('Tab');
      expect(queryPanel()).toBeNull();
    });

    it('should clear on Backspace when clearable with values', () => {
      host.clearable.set(true);
      host.value.set([1, 3]);
      fixture.detectChanges();

      keydown('Backspace');
      expect(selectedValue()).toEqual([]);
    });
  });

  describe('accessibility', () => {
    it('should expose the combobox role and not set aria-controls while closed', () => {
      expect(trigger.getAttribute('role')).toBe('combobox');
      expect(trigger.getAttribute('aria-controls')).toBeNull();
    });

    it('should point aria-controls at the listbox while open', () => {
      trigger.click();
      fixture.detectChanges();

      const listbox = queryPanel();
      const listboxId = listbox?.getAttribute('id');
      expect(listboxId).toBeTruthy();
      expect(trigger.getAttribute('aria-controls')).toBe(listboxId);
    });

    it('should track the active option via aria-activedescendant', () => {
      keydown('ArrowDown'); // opens, active = 0 (One)

      const activeOption = queryActiveOption()?.querySelector('.tls-multi-select__option-button');
      expect(activeOption?.getAttribute('id')).toBeTruthy();
      expect(trigger.getAttribute('aria-activedescendant')).toBe(
        activeOption?.getAttribute('id') ?? null,
      );
    });
  });

  it('should dispose the overlay when destroyed while open', () => {
    trigger.click();
    fixture.detectChanges();
    expect(queryPanel()).not.toBeNull();

    fixture.destroy();

    expect(queryPanel()).toBeNull();
  });
});
