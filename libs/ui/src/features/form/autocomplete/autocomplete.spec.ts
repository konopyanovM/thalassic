import { OverlayContainer } from '@angular/cdk/overlay';
import { Component, signal, viewChild } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Autocomplete } from './autocomplete';
import { autocompleteFilterMode } from './autocomplete-filter-mode';

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
  imports: [Autocomplete],
  template: `
    <tls-autocomplete
      [options]="options()"
      [value]="value()"
      [clearable]="clearable()"
      [disabled]="disabled()"
      [filterMode]="filterMode()"
      [virtualScroll]="virtualScroll()"
      [loading]="loading()"
      [minQueryLength]="minQueryLength()"
      (queryChange)="recordQuery($event)"
      optionLabel="label"
      optionValue="value"
      optionDisabled="disabled"
    />
  `,
})
class HostComponent {
  public readonly options = signal<Option[]>([
    { label: 'Apple', value: 1, disabled: false },
    { label: 'Apricot', value: 2, disabled: false },
    { label: 'Banana', value: 3, disabled: true },
    { label: 'Cherry', value: 4, disabled: false },
  ]);
  public readonly value = signal<number | null>(null);
  public readonly clearable = signal(false);
  public readonly disabled = signal(false);
  public readonly filterMode = signal<autocompleteFilterMode>('contains');
  public readonly virtualScroll = signal(false);
  public readonly loading = signal(false);
  public readonly minQueryLength = signal(0);
  public readonly queries: string[] = [];
  public readonly autocomplete = viewChild.required(Autocomplete);

  public recordQuery(query: string): void {
    this.queries.push(query);
  }
}

describe('Autocomplete', () => {
  let fixture: ComponentFixture<HostComponent>;
  let host: HostComponent;
  let trigger: HTMLInputElement;
  let overlayContainer: OverlayContainer;
  let overlayContainerElement: HTMLElement;

  const selectedValue = () => host.autocomplete().value();
  const queryPanel = () =>
    overlayContainerElement.querySelector<HTMLElement>('.tls-autocomplete__panel');
  const queryOptions = () =>
    Array.from(
      overlayContainerElement.querySelectorAll<HTMLButtonElement>(
        '.tls-autocomplete__option-button',
      ),
    );
  const queryActiveOption = () =>
    overlayContainerElement.querySelector<HTMLElement>('.tls-autocomplete__option--active');
  const queryEmpty = () =>
    overlayContainerElement.querySelector<HTMLElement>('.tls-autocomplete__empty');
  const queryClear = () =>
    (fixture.nativeElement as HTMLElement).querySelector<HTMLButtonElement>(
      '.tls-autocomplete__clear',
    );
  const type = (text: string) => {
    trigger.value = text;
    trigger.dispatchEvent(new Event('input', { bubbles: true }));
    fixture.detectChanges();
  };
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

    trigger = fixture.nativeElement.querySelector('.tls-autocomplete__trigger');
  });

  afterEach(() => {
    overlayContainer.ngOnDestroy();
  });

  it('should create', () => {
    expect(host.autocomplete()).toBeTruthy();
  });

  it('should start closed', () => {
    expect(queryPanel()).toBeNull();
    expect(fixture.nativeElement.querySelector('.tls-autocomplete--open')).toBeNull();
  });

  describe('open / close', () => {
    it('should open the panel on trigger click and list every option', () => {
      trigger.click();
      fixture.detectChanges();

      expect(queryPanel()).not.toBeNull();
      expect(queryOptions().length).toBe(4);
      expect(trigger.getAttribute('aria-expanded')).toBe('true');
    });

    it('should open on typing', () => {
      type('Ap');
      expect(queryPanel()).not.toBeNull();
    });

    it('should not open when disabled', () => {
      host.disabled.set(true);
      fixture.detectChanges();

      keydown('ArrowDown');

      expect(queryPanel()).toBeNull();
    });

    it('should mark the currently selected option active on open', () => {
      host.value.set(4);
      fixture.detectChanges();

      trigger.click();
      fixture.detectChanges();

      expect(queryActiveOption()?.textContent?.trim()).toBe('Cherry');
    });
  });

  describe('filtering', () => {
    it('should narrow the options to a case-insensitive substring match', () => {
      type('ap');

      const labels = queryOptions().map(option => option.textContent?.trim());
      expect(labels).toEqual(['Apple', 'Apricot']);
    });

    it('should match only the start of the label in startsWith mode', () => {
      host.filterMode.set('startsWith');
      fixture.detectChanges();

      type('err');
      expect(queryEmpty()).not.toBeNull();

      type('cher');
      expect(queryOptions().map(option => option.textContent?.trim())).toEqual(['Cherry']);
    });

    it('should render the empty message when nothing matches', () => {
      type('zzz');

      expect(queryOptions().length).toBe(0);
      expect(queryEmpty()).not.toBeNull();
    });

    it('should reflect an externally set value as the field text', () => {
      host.value.set(2);
      fixture.detectChanges();

      expect(trigger.value).toBe('Apricot');
    });

    it('should keep the committed value while filtering and revert the text when closed', () => {
      host.value.set(1);
      fixture.detectChanges();
      expect(trigger.value).toBe('Apple');

      type('Ban'); // filters, committed value untouched
      expect(selectedValue()).toBe(1);

      keydown('Escape'); // abandons the query
      expect(trigger.value).toBe('Apple');
      expect(selectedValue()).toBe(1);
    });
  });

  describe('query output', () => {
    it('should emit the field text as it is typed', () => {
      type('Ap');
      type('Apr');

      expect(host.queries).toEqual(['Ap', 'Apr']);
    });

    it('should not emit when committing a selection rewrites the text', () => {
      type('Ap');
      host.queries.length = 0;

      queryOptions()[0].click();
      fixture.detectChanges();

      expect(trigger.value).toBe('Apple');
      expect(host.queries).toEqual([]);
    });

    it('should not emit when the control is cleared', () => {
      host.clearable.set(true);
      host.value.set(1);
      fixture.detectChanges();

      queryClear()?.click();
      fixture.detectChanges();

      expect(trigger.value).toBe('');
      expect(host.queries).toEqual([]);
    });

    it('should not emit when closing restores the committed label', () => {
      host.value.set(1);
      fixture.detectChanges();

      type('Ban');
      host.queries.length = 0;
      keydown('Escape');

      expect(trigger.value).toBe('Apple');
      expect(host.queries).toEqual([]);
    });

    it('should stay silent and show nothing until the query reaches minQueryLength', () => {
      host.minQueryLength.set(3);
      fixture.detectChanges();

      type('Ap');
      expect(host.queries).toEqual([]);
      expect(queryOptions().length).toBe(0);
      expect(queryEmpty()).toBeNull();
      expect(queryPanel()?.classList.contains('tls-autocomplete__panel--hidden')).toBe(true);

      type('App');
      expect(host.queries).toEqual(['App']);
      expect(queryOptions().map(option => option.textContent?.trim())).toEqual(['Apple']);
    });
  });

  describe('remote search', () => {
    const queryLoading = () =>
      overlayContainerElement.querySelector<HTMLElement>('.tls-autocomplete__loading');

    beforeEach(() => {
      host.filterMode.set('none');
      fixture.detectChanges();
    });

    it('should leave the options untouched however the query reads', () => {
      type('zzz');

      expect(queryOptions().length).toBe(4);
    });

    it('should keep showing what the source returned after a selection is committed', () => {
      type('ap');
      queryOptions()[0].click(); // commits "Apple"
      fixture.detectChanges();

      // The source answers the next keystroke with a set of its own.
      host.options.set([{ label: 'Cherry', value: 4, disabled: false }]);
      type('c');

      expect(queryOptions().map(option => option.textContent?.trim())).toEqual(['Cherry']);
    });

    it('should show the loading state in place of the empty message', () => {
      host.options.set([]);
      host.loading.set(true);
      fixture.detectChanges();

      type('ap');

      expect(queryEmpty()).toBeNull();
      expect(queryLoading()?.textContent?.trim()).toContain('Loading');
    });

    it('should fall back to the empty message once loading ends', () => {
      host.options.set([]);
      host.loading.set(true);
      fixture.detectChanges();

      type('ap');
      host.loading.set(false);
      fixture.detectChanges();

      expect(queryLoading()).toBeNull();
      expect(queryEmpty()).not.toBeNull();
    });

    it('should reflect the loading state on the host and announce it politely', () => {
      host.loading.set(true);
      fixture.detectChanges();

      const status = (fixture.nativeElement as HTMLElement).querySelector(
        '.tls-autocomplete__status',
      );
      expect(
        (fixture.nativeElement as HTMLElement).querySelector('.tls-autocomplete--loading'),
      ).not.toBeNull();
      expect(trigger.getAttribute('aria-busy')).toBe('true');
      expect(status?.getAttribute('role')).toBe('status');
      expect(status?.textContent?.trim()).toBe('Loading');
    });
  });

  describe('selection', () => {
    it('should set the value, reflect the label and close when an option is clicked', () => {
      type('Ap');

      queryOptions()[1].click();
      fixture.detectChanges();

      expect(selectedValue()).toBe(2);
      expect(trigger.value).toBe('Apricot');
      expect(queryPanel()).toBeNull();
    });

    it('should ignore clicks on disabled options', () => {
      trigger.click();
      fixture.detectChanges();

      // index 2 ("Banana") is disabled
      queryOptions()[2].click();
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

    it('should reset the value and the text when the clear button is clicked', () => {
      host.clearable.set(true);
      host.value.set(1);
      fixture.detectChanges();

      queryClear()?.click();
      fixture.detectChanges();

      expect(selectedValue()).toBeNull();
      expect(trigger.value).toBe('');
    });
  });

  describe('keyboard', () => {
    it('should open on ArrowDown when closed', () => {
      keydown('ArrowDown');
      expect(queryPanel()).not.toBeNull();
    });

    it('should move active down skipping disabled options', () => {
      keydown('ArrowDown'); // opens, active "Apple"
      keydown('ArrowDown'); // -> "Apricot"
      expect(queryActiveOption()?.textContent?.trim()).toBe('Apricot');

      keydown('ArrowDown'); // skips disabled "Banana" -> "Cherry"
      expect(queryActiveOption()?.textContent?.trim()).toBe('Cherry');
    });

    it('should select the active option on Enter', () => {
      type('Ap'); // active "Apple"
      keydown('Enter');

      expect(selectedValue()).toBe(1);
      expect(trigger.value).toBe('Apple');
      expect(queryPanel()).toBeNull();
    });

    it('should clear the query and close on Escape when nothing is committed', () => {
      type('App');
      keydown('Escape');

      expect(queryPanel()).toBeNull();
      expect(trigger.value).toBe('');
    });

    it('should close on Tab', () => {
      keydown('ArrowDown'); // opens
      keydown('Tab');
      expect(queryPanel()).toBeNull();
    });

    it('should swallow Enter while the panel is open even with no matches', () => {
      type('zzz'); // opens with an empty result set

      const event = new KeyboardEvent('keydown', {
        key: 'Enter',
        bubbles: true,
        cancelable: true,
      });
      trigger.dispatchEvent(event);
      fixture.detectChanges();

      // Prevented so it cannot submit a surrounding form while the list is showing.
      expect(event.defaultPrevented).toBe(true);
      expect(selectedValue()).toBeNull();
      expect(queryPanel()).not.toBeNull();
    });
  });

  describe('accessibility', () => {
    it('should expose the combobox role with list autocomplete', () => {
      expect(trigger.getAttribute('role')).toBe('combobox');
      expect(trigger.getAttribute('aria-autocomplete')).toBe('list');
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
      host.value.set(4);
      fixture.detectChanges();

      trigger.click(); // opens with "Cherry" active
      fixture.detectChanges();

      const activeOption = queryActiveOption()?.querySelector('.tls-autocomplete__option-button');
      expect(activeOption?.getAttribute('id')).toBeTruthy();
      expect(trigger.getAttribute('aria-activedescendant')).toBe(
        activeOption?.getAttribute('id') ?? null,
      );
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

    it('should render only a window of a large option list in the listbox viewport', async () => {
      trigger.click();
      fixture.detectChanges();
      await settle();

      const viewport = queryViewport();
      expect(viewport?.getAttribute('role')).toBe('listbox');
      expect(trigger.getAttribute('aria-controls')).toBe(viewport?.getAttribute('id'));
      const rendered = queryOptions().length;
      expect(rendered).toBeGreaterThan(0);
      expect(rendered).toBeLessThan(MANY_OPTIONS.length);
    });

    it('should narrow the windowed list as the user types', async () => {
      trigger.click();
      fixture.detectChanges();
      await settle();

      type('Option 999');
      await settle();

      expect(queryOptions().length).toBe(1);
      expect(queryOptions()[0].getAttribute('aria-setsize')).toBe('1');
    });

    it('should show the empty state outside the viewport when nothing matches', async () => {
      trigger.click();
      fixture.detectChanges();
      await settle();

      type('no such option');
      await settle();

      const empty = queryEmpty();
      expect(empty).not.toBeNull();
      expect(empty?.closest('.tls-virtual-scroll__viewport')).toBeNull();
      expect(queryOptions().length).toBe(0);
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
