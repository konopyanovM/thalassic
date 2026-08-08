import { OverlayContainer } from '@angular/cdk/overlay';
import { Component, signal, viewChild } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Select } from './select';

interface Option {
  label: string;
  value: number;
  disabled: boolean;
}

// jsdom does not implement Element.scrollTo, which the CDK virtual-scroll viewport
// drives whenever the control keeps the active option in view.
if (!Element.prototype.scrollTo) {
  Element.prototype.scrollTo = function (this: Element, options?: ScrollToOptions | number): void {
    if (typeof options !== 'object' || options === null) return;
    if (options.left !== undefined) this.scrollLeft = options.left;
    if (options.top !== undefined) this.scrollTop = options.top;
  } as typeof Element.prototype.scrollTo;
}

@Component({
  imports: [Select],
  template: `
    <tls-select
      [options]="options()"
      [value]="value()"
      [clearable]="clearable()"
      [disabled]="disabled()"
      [virtualScroll]="virtualScroll()"
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
  public readonly value = signal<number | null>(null);
  public readonly clearable = signal(false);
  public readonly disabled = signal(false);
  public readonly virtualScroll = signal(false);
  public readonly select = viewChild.required(Select);
}

/**
 * Characterization tests for the overlay lifecycle and keyboard interaction that
 * Select currently re-implements on top of the CDK Overlay. These pin the
 * observable behavior so it survives the planned extraction of a shared overlay
 * primitive.
 */
describe('Select', () => {
  let fixture: ComponentFixture<HostComponent>;
  let host: HostComponent;
  let trigger: HTMLButtonElement;
  let overlayContainer: OverlayContainer;
  let overlayContainerElement: HTMLElement;

  // The Select's own model reflects the committed selection (the host binds
  // `value` one-way, so reads go through the component instance).
  const selectedValue = () => host.select().value();
  const queryPanel = () => overlayContainerElement.querySelector<HTMLElement>('.tls-select__panel');
  const queryOptions = () =>
    Array.from(
      overlayContainerElement.querySelectorAll<HTMLButtonElement>('.tls-select__option-button'),
    );
  const queryActiveOption = () =>
    overlayContainerElement.querySelector<HTMLElement>('.tls-select__option--active');
  const queryBackdrop = () =>
    overlayContainerElement.querySelector<HTMLElement>('.cdk-overlay-backdrop');
  const queryClear = () =>
    (fixture.nativeElement as HTMLElement).querySelector<HTMLButtonElement>('.tls-select__clear');
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

    trigger = fixture.nativeElement.querySelector('.tls-select__trigger');
  });

  afterEach(() => {
    overlayContainer.ngOnDestroy();
  });

  it('should create', () => {
    expect(host.select()).toBeTruthy();
  });

  it('should start closed', () => {
    expect(queryPanel()).toBeNull();
    expect(fixture.nativeElement.querySelector('.tls-select--open')).toBeNull();
  });

  describe('open / close via trigger', () => {
    it('should open the panel on trigger click and mark the host open', () => {
      trigger.click();
      fixture.detectChanges();

      expect(queryPanel()).not.toBeNull();
      expect(fixture.nativeElement.querySelector('.tls-select--open')).not.toBeNull();
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

    it('should mark the currently selected option active on open', () => {
      host.value.set(3);
      fixture.detectChanges();

      trigger.click();
      fixture.detectChanges();

      expect(queryActiveOption()?.textContent?.trim()).toBe('Three');
    });
  });

  describe('selection', () => {
    it('should set the value and close when an option is clicked', () => {
      trigger.click();
      fixture.detectChanges();

      queryOptions()[0].click();
      fixture.detectChanges();

      expect(selectedValue()).toBe(1);
      expect(queryPanel()).toBeNull();
    });

    it('should ignore clicks on disabled options', () => {
      trigger.click();
      fixture.detectChanges();

      // index 1 ("Two") is disabled
      queryOptions()[1].click();
      fixture.detectChanges();

      expect(selectedValue()).toBeNull();
      expect(queryPanel()).not.toBeNull();
    });
  });

  describe('clear', () => {
    it('should show a clear button only when clearable and a value is set', () => {
      host.clearable.set(true);
      fixture.detectChanges();
      expect(queryClear()).toBeNull();

      host.value.set(1);
      fixture.detectChanges();
      expect(queryClear()).not.toBeNull();
    });

    it('should reset the value when the clear button is clicked', () => {
      host.clearable.set(true);
      host.value.set(1);
      fixture.detectChanges();

      queryClear()?.click();
      fixture.detectChanges();

      expect(selectedValue()).toBeNull();
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
      keydown('ArrowDown'); // opens; active starts on the first enabled option (One)
      expect(queryActiveOption()?.textContent?.trim()).toBe('One');

      keydown('ArrowDown'); // skips disabled "Two" -> index 2 (Three)
      expect(queryActiveOption()?.textContent?.trim()).toBe('Three');
    });

    it('should move active to the last enabled option on End', () => {
      keydown('ArrowDown'); // opens
      keydown('End');
      expect(queryActiveOption()?.textContent?.trim()).toBe('Three');
    });

    it('should move active to the first enabled option on Home', () => {
      keydown('ArrowDown'); // opens
      keydown('End'); // -> Three
      keydown('Home');
      expect(queryActiveOption()?.textContent?.trim()).toBe('One');
    });

    it('should select the active option on Enter', () => {
      keydown('ArrowDown'); // opens; active starts on the first enabled option (One)
      keydown('Enter');

      expect(selectedValue()).toBe(1);
      expect(queryPanel()).toBeNull();
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

    it('should clamp the active option when the option list shrinks while open', () => {
      keydown('ArrowDown'); // opens; active starts on the first enabled option (One)
      keydown('End'); // -> Three (index 2)

      host.options.set([{ label: 'One', value: 1, disabled: false }]);
      fixture.detectChanges();

      expect(queryActiveOption()?.textContent?.trim()).toBe('One');
      const activeDescendantId = trigger.getAttribute('aria-activedescendant');
      expect(activeDescendantId).toBeTruthy();
      expect(document.getElementById(activeDescendantId ?? '')).not.toBeNull();
    });

    it('should clear on Backspace when clearable with a value', () => {
      host.clearable.set(true);
      host.value.set(1);
      fixture.detectChanges();

      keydown('Backspace');
      expect(selectedValue()).toBeNull();
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

      const listboxId = queryPanel()?.getAttribute('id');
      expect(listboxId).toBeTruthy();
      expect(trigger.getAttribute('aria-controls')).toBe(listboxId);
    });

    it('should track the active option via aria-activedescendant', () => {
      host.value.set(3);
      fixture.detectChanges();

      trigger.click(); // opens with "Three" active
      fixture.detectChanges();

      const activeOption = queryActiveOption()?.querySelector('.tls-select__option-button');
      expect(activeOption?.getAttribute('id')).toBeTruthy();
      expect(trigger.getAttribute('aria-activedescendant')).toBe(
        activeOption?.getAttribute('id') ?? null,
      );
    });
  });

  describe('active option scrolling', () => {
    let scrollIntoView: ReturnType<typeof vi.fn<(options?: ScrollIntoViewOptions) => void>>;

    beforeEach(() => {
      // jsdom does not implement scrollIntoView; the assertion is that the control
      // asks for the minimal scroll at all.
      scrollIntoView = vi.fn<(options?: ScrollIntoViewOptions) => void>();
      Element.prototype.scrollIntoView = scrollIntoView;
    });

    it('should scroll the active option into view on keyboard navigation', async () => {
      keydown('ArrowDown'); // opens; active starts on the first enabled option
      await fixture.whenStable();
      scrollIntoView.mockClear();

      keydown('ArrowDown');
      await fixture.whenStable();

      expect(scrollIntoView).toHaveBeenCalledWith({ block: 'nearest' });
    });

    it('should scroll the initially active option into view on open', async () => {
      host.value.set(3);
      fixture.detectChanges();

      trigger.click(); // opens with "Three" active
      await fixture.whenStable();

      expect(scrollIntoView).toHaveBeenCalledWith({ block: 'nearest' });
    });
  });

  describe('virtual scroll', () => {
    const MANY_OPTIONS: Option[] = Array.from({ length: 1000 }, (_, index) => ({
      label: `Option ${index}`,
      value: index,
      disabled: false,
    }));

    const queryViewport = () =>
      overlayContainerElement.querySelector<HTMLElement>('.tls-virtual-scroll__viewport');

    // The CDK viewport finishes initializing in a microtask scheduled outside Angular,
    // so the rendered window only exists after a full event-loop turn.
    const settle = async () => {
      await fixture.whenStable();
      await new Promise(resolve => setTimeout(resolve));
      fixture.detectChanges();
    };

    beforeEach(() => {
      host.virtualScroll.set(true);
      host.options.set(MANY_OPTIONS);
      fixture.detectChanges();
    });

    it('should render only a window of a large option list', async () => {
      trigger.click();
      fixture.detectChanges();
      await settle();

      const rendered = queryOptions().length;
      expect(rendered).toBeGreaterThan(0);
      expect(rendered).toBeLessThan(MANY_OPTIONS.length);
    });

    it('should make the viewport the listbox that aria-controls points at', async () => {
      trigger.click();
      fixture.detectChanges();
      await settle();

      const viewport = queryViewport();
      expect(viewport?.getAttribute('role')).toBe('listbox');
      expect(viewport?.getAttribute('id')).toBeTruthy();
      expect(trigger.getAttribute('aria-controls')).toBe(viewport?.getAttribute('id'));
    });

    it('should report each option position within the whole collection', async () => {
      trigger.click();
      fixture.detectChanges();
      await settle();

      const first = queryOptions()[0];
      expect(first.getAttribute('aria-posinset')).toBe('1');
      expect(first.getAttribute('aria-setsize')).toBe(String(MANY_OPTIONS.length));
    });

    it('should keep the aria-activedescendant element rendered while navigating', async () => {
      keydown('ArrowDown'); // opens
      await settle();

      keydown('ArrowDown');
      keydown('ArrowDown');
      await settle();

      const activeDescendantId = trigger.getAttribute('aria-activedescendant');
      expect(activeDescendantId).toBeTruthy();
      const activeOption = document.getElementById(activeDescendantId ?? '');
      expect(activeOption).not.toBeNull();
      expect(activeOption?.getAttribute('role')).toBe('option');
    });

    it('should set the value and close when an option is clicked', async () => {
      trigger.click();
      fixture.detectChanges();
      await settle();

      queryOptions()[1].click();
      fixture.detectChanges();

      expect(selectedValue()).toBe(1);
      expect(queryPanel()).toBeNull();
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
