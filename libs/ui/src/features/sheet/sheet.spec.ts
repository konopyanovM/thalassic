import { OverlayContainer } from '@angular/cdk/overlay';
import { ApplicationRef, Component, signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { PanDirective, PanEvent } from '@thalassic/core';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { Sheet } from './sheet';
import { SheetHeaderDirective } from './sheet-header.directive';
import { SheetDetent } from './sheet.types';

@Component({
  imports: [Sheet, SheetHeaderDirective],
  template: `
    <tls-sheet
      [detents]="detents"
      [modalFrom]="modalFrom()"
      [(detent)]="detent"
      label="Session"
      [detentLabels]="{ lip: 'Collapsed', half: 'Half open', full: 'Open' }"
    >
      <ng-template tlsSheetHeader><span class="title">Now playing</span></ng-template>
      <p class="line">Body</p>
    </tls-sheet>
  `,
})
class HostComponent {
  readonly detents: SheetDetent[] = [
    { id: 'lip', size: 'header' },
    { id: 'half', size: '30%' },
    { id: 'full', size: '20rem' },
  ];
  readonly modalFrom = signal<string | null>(null);
  // A signal, so a write from the test marks this OnPush host for check.
  readonly detent = signal('lip');
}


describe('Sheet', () => {
  let fixture: ComponentFixture<HostComponent>;
  let host: HostComponent;
  let sheet: Sheet;
  let container: HTMLElement;

  // The one element in the overlay matching `selector`; a missing one fails the test.
  function query(selector: string): HTMLElement {
    const element = container.querySelector<HTMLElement>(selector);
    if (element === null) throw new Error(`${selector} not rendered`);
    return element;
  }

  // Sizes jsdom never computes: heights come out as [80, 240, 320] — header,
  // 30% of the 800px viewport, and 20rem through the probe. The probe answers
  // by the length it is given: no safe-area inset, and 320 for the `20rem` detent.
  // jsdom's style parser drops an `env()` value, so the probe keeps the length
  // it was last given itself rather than reading it back from its style.
  function stubSizes(): void {
    Object.defineProperty(query('.tls-sheet__header'), 'offsetHeight', { value: 80, configurable: true });
    Object.defineProperty(query('.tls-sheet__content'), 'offsetHeight', { value: 300, configurable: true });
    const probe = query('.tls-sheet__probe');
    let requested = '';
    Object.defineProperty(probe.style, 'block-size', {
      get: () => requested,
      set: (length: string) => {
        requested = length;
      },
      configurable: true,
    });
    Object.defineProperty(probe, 'offsetHeight', {
      get: () => (requested.includes('env(') ? 0 : 320),
      configurable: true,
    });
    Object.defineProperty(document.documentElement, 'clientHeight', { value: 800, configurable: true });
  }

  // Whether the root carries a motion state class; change detection first,
  // since the classes are bindings.
  function isMoving(): boolean {
    fixture.detectChanges();
    const root = query('.tls-sheet');
    return root.classList.contains('tls-sheet--dragging') || root.classList.contains('tls-sheet--settling');
  }

  function panelOffset(): string {
    return query('.tls-sheet__panel').style.getPropertyValue('--tls-sheet-offset');
  }

  // Drives the render a settle waits on, then waits for the engine to rest.
  async function settle(): Promise<void> {
    TestBed.inject(ApplicationRef).tick();
    await vi.waitFor(() => expect(isMoving()).toBe(false));
  }

  function pressKey(key: string): void {
    query('.tls-sheet__header').dispatchEvent(new KeyboardEvent('keydown', { key, bubbles: true }));
  }

  beforeEach(async () => {
    // jsdom has no ResizeObserver; the sheet only needs it to exist.
    vi.stubGlobal(
      'ResizeObserver',
      class {
        readonly observe = vi.fn();
        readonly unobserve = vi.fn();
        readonly disconnect = vi.fn();
      },
    );
    await TestBed.configureTestingModule({ imports: [HostComponent] }).compileComponents();
    fixture = TestBed.createComponent(HostComponent);
    host = fixture.componentInstance;
    container = TestBed.inject(OverlayContainer).getContainerElement();
    fixture.detectChanges();
    await fixture.whenStable();
    sheet = fixture.debugElement.children[0].componentInstance as Sheet;
    stubSizes();
    sheet.remeasure();
    fixture.detectChanges();
  });

  afterEach(() => {
    fixture.destroy();
    delete (document.documentElement as { clientHeight?: number }).clientHeight;
    vi.unstubAllGlobals();
  });

  it('renders its panel in the overlay container and nothing in the page', () => {
    expect(container.querySelector('.tls-sheet-pane .tls-sheet__panel')).not.toBeNull();
    expect(fixture.nativeElement.querySelector('.tls-sheet__panel')).toBeNull();
    expect(container.querySelector('.tls-sheet__header .title')).not.toBeNull();
    expect(container.querySelector('.tls-sheet__body .line')).not.toBeNull();
  });

  it('rests at the first detent and publishes its height for the page', () => {
    expect(host.detent()).toBe('lip');
    expect(document.documentElement.style.getPropertyValue('--tls-sheet-collapsed-size')).toBe('80px');
    const panel = query('.tls-sheet__panel');
    // Author order is kept, not sorted: the largest detent is the last one.
    expect(panel.style.getPropertyValue('--tls-sheet-height')).toBe('320px');
    expect(panel.style.getPropertyValue('--tls-sheet-offset')).toBe('240px');
  });

  it('places itself at once, with no motion', () => {
    expect(isMoving()).toBe(false);
    expect(panelOffset()).toBe('240px');
  });

  it('round-trips the detent model through snapTo', async () => {
    sheet.snapTo('half');
    expect(isMoving()).toBe(true);

    await settle();

    expect(host.detent()).toBe('half');
    expect(panelOffset()).toBe('80px');
  });

  it('moves when the page writes the detent', async () => {
    host.detent.set('full');
    fixture.detectChanges();

    await settle();

    expect(panelOffset()).toBe('0px');
  });

  it('expands from the header button and reflects the state in aria', async () => {
    const header = query('.tls-sheet__header');
    expect(header.getAttribute('aria-expanded')).toBe('false');
    expect(header.getAttribute('aria-description')).toBe('Session: Collapsed');
    expect(query('.tls-sheet__panel').getAttribute('role')).toBe('region');

    header.click();
    await settle();

    expect(host.detent()).toBe('half');
    expect(header.getAttribute('aria-expanded')).toBe('true');
    expect(header.getAttribute('aria-description')).toBe('Session: Half open');
  });

  it('collapses from the header button at the largest detent', async () => {
    sheet.snapTo('full');
    await settle();

    query('.tls-sheet__header').click();
    await settle();

    expect(host.detent()).toBe('half');
  });

  it('expands on ArrowUp and collapses on ArrowDown', async () => {
    pressKey('ArrowUp');
    await settle();
    expect(host.detent()).toBe('half');

    pressKey('ArrowDown');
    await settle();
    expect(host.detent()).toBe('lip');
  });

  it('steps on from the detent it is heading to when expanded mid-settle', async () => {
    sheet.expand();
    sheet.expand();
    await settle();

    expect(host.detent()).toBe('full');
  });

  it('sets the scrim for the detent it starts at', async () => {
    // A fresh sheet that starts at `full`, set up the way `beforeEach` sets up its own.
    async function startAtFull(modalFrom: string | null): Promise<HTMLElement> {
      fixture.destroy();
      fixture = TestBed.createComponent(HostComponent);
      fixture.componentInstance.detent.set('full');
      fixture.componentInstance.modalFrom.set(modalFrom);
      fixture.detectChanges();
      await fixture.whenStable();
      sheet = fixture.debugElement.children[0].componentInstance as Sheet;
      stubSizes();
      sheet.remeasure();
      fixture.detectChanges();
      return query('.tls-sheet__backdrop');
    }

    expect((await startAtFull('full')).style.opacity).toBe('1');
    expect((await startAtFull(null)).style.opacity).toBe('0');
  });

  it('marks the root as top only at the largest detent', async () => {
    const root = query('.tls-sheet');
    expect(root.classList.contains('tls-sheet--top')).toBe(false);

    sheet.snapTo('half');
    await settle();
    expect(root.classList.contains('tls-sheet--top')).toBe(false);

    sheet.snapTo('full');
    await settle();
    expect(root.classList.contains('tls-sheet--top')).toBe(true);
  });

  it('removes the published height and the pane on destroy', async () => {
    fixture.destroy();

    expect(document.documentElement.style.getPropertyValue('--tls-sheet-collapsed-size')).toBe('');
    await vi.waitFor(() => expect(container.querySelector('.tls-sheet-pane')).toBeNull());
  });

  describe('drag', () => {
    function pan(): PanDirective {
      return fixture.debugElement.query(By.directive(PanDirective)).injector.get(PanDirective);
    }

    function panEvent(deltaY: number, velocityY = 0, target?: Element): PanEvent {
      const originalEvent = { target: target ?? container.querySelector('.tls-sheet__header') } as unknown as PointerEvent;
      return {
        deltaX: 0,
        deltaY,
        distance: Math.abs(deltaY),
        velocityX: 0,
        velocityY,
        direction: deltaY < 0 ? 'up' : 'down',
        logicalDirection: deltaY < 0 ? 'up' : 'down',
        pointerType: 'touch',
        originalEvent,
      };
    }

    it('follows the finger between detents and settles on the nearest past the ratio', async () => {
      const gesture = pan();
      gesture.panStart.emit(panEvent(-10));
      expect(isMoving()).toBe(true);

      gesture.panMove.emit(panEvent(-100));
      // From 80px up 100 = 180px tall: offset = 320 − 180.
      expect(panelOffset()).toBe('140px');

      // Released at 230px: past 40% of the 80→240 gap, and nearer 240 than 320.
      gesture.panEnd.emit(panEvent(-150, 0));
      await settle();

      expect(host.detent()).toBe('half');
    });

    it('steps one detent on a flick however short the drag', async () => {
      const gesture = pan();
      gesture.panStart.emit(panEvent(-5));
      gesture.panEnd.emit(panEvent(-8, -1));
      await settle();

      expect(host.detent()).toBe('half');
    });

    it('snaps back on cancel', async () => {
      const gesture = pan();
      gesture.panStart.emit(panEvent(-10));
      gesture.panMove.emit(panEvent(-150));
      gesture.panCancel.emit();
      await settle();

      expect(host.detent()).toBe('lip');
      expect(panelOffset()).toBe('240px');
    });

    it('rubber-bands below the smallest detent and holds at the largest', () => {
      const gesture = pan();
      gesture.panStart.emit(panEvent(10));
      gesture.panMove.emit(panEvent(60));
      // 60px below the lip: a third of the overshoot on top of the full travel.
      expect(panelOffset()).toBe('260px');

      gesture.panMove.emit(panEvent(600));
      expect(panelOffset()).toBe('272px');

      gesture.panMove.emit(panEvent(-900));
      expect(panelOffset()).toBe('0px');
    });

    it('leaves a pan inside a scrolled body to the body at the top detent', async () => {
      sheet.snapTo('full');
      await settle();
      const body = container.querySelector<HTMLElement>('.tls-sheet__body');
      if (body === null) throw new Error('no body');
      Object.defineProperty(body, 'scrollTop', { value: 40, configurable: true });

      const gesture = pan();
      gesture.panStart.emit(panEvent(20, 0, body));

      expect(isMoving()).toBe(false);
      gesture.panMove.emit(panEvent(80, 0, body));
      expect(panelOffset()).toBe('0px');
    });

    it('takes a downward pan inside the body once the body is at its top', () => {
      sheet.snapTo('full');
      return settle().then(() => {
        const body = container.querySelector<HTMLElement>('.tls-sheet__body');
        if (body === null) throw new Error('no body');
        Object.defineProperty(body, 'scrollTop', { value: 0, configurable: true });

        pan().panStart.emit(panEvent(20, 0, body));
        expect(isMoving()).toBe(true);
      });
    });
  });

  describe('modality', () => {
    // Page-level elements a test adds beside the fixture, removed after it.
    let added: HTMLElement[] = [];

    function addToPage<K extends keyof HTMLElementTagNameMap>(tag: K): HTMLElementTagNameMap[K] {
      const element = document.createElement(tag);
      document.body.appendChild(element);
      added.push(element);
      return element;
    }

    // The sheet hears Escape at the document, wherever focus sits.
    function pressEscape(target: EventTarget = document): void {
      target.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));
    }

    beforeEach(async () => {
      host.modalFrom.set('half');
      fixture.detectChanges();
      await fixture.whenStable();
    });

    afterEach(() => {
      for (const element of added) element.remove();
      added = [];
    });

    it('is a region below modalFrom and a dialog from it, with the page inert', async () => {
      const panel = query('.tls-sheet__panel');
      expect(panel.getAttribute('role')).toBe('region');
      expect(fixture.nativeElement.hasAttribute('inert')).toBe(false);

      sheet.snapTo('half');
      await settle();

      expect(panel.getAttribute('role')).toBe('dialog');
      expect(panel.getAttribute('aria-modal')).toBe('true');
      expect(fixture.nativeElement.hasAttribute('inert')).toBe(true);
      expect(container.hasAttribute('inert')).toBe(false);
      expect(document.activeElement).toBe(query('.tls-sheet__header'));
    });

    it('collapses to the highest non-modal detent on Escape and releases the page', async () => {
      sheet.snapTo('full');
      await settle();

      const panel = query('.tls-sheet__panel');
      pressEscape();
      await settle();

      expect(host.detent()).toBe('lip');
      expect(fixture.nativeElement.hasAttribute('inert')).toBe(false);
      expect(panel.getAttribute('role')).toBe('region');
    });

    it('leaves an Escape typed in another overlay to that overlay', async () => {
      sheet.snapTo('half');
      await settle();
      // Stands in for a drawer stacked above the sheet in the same container.
      const otherOverlay = document.createElement('div');
      container.appendChild(otherOverlay);

      pressEscape(otherOverlay);
      await settle();
      otherOverlay.remove();

      expect(host.detent()).toBe('half');
    });

    it('collapses on a backdrop tap', async () => {
      sheet.snapTo('half');
      await settle();

      query('.tls-sheet__backdrop').click();
      await settle();

      expect(host.detent()).toBe('lip');
    });

    it('does nothing on Escape while not modal', async () => {
      // With `full` modal, a collapse that ignored the guard would settle at `half`.
      host.modalFrom.set('full');
      fixture.detectChanges();
      await fixture.whenStable();

      pressEscape();
      await settle();

      expect(host.detent()).toBe('lip');
    });

    it('returns focus to the header and releases the page on Escape', async () => {
      sheet.snapTo('half');
      await settle();
      // Focus off the header first, so its return is what the test sees.
      const body = query('.tls-sheet__body');
      body.tabIndex = -1;
      body.focus();
      expect(document.activeElement).toBe(body);

      pressEscape();
      await settle();

      expect(document.activeElement).toBe(query('.tls-sheet__header'));
      expect(fixture.nativeElement.hasAttribute('inert')).toBe(false);
    });

    it('releases the page and restores its focus when destroyed while modal', async () => {
      const button = addToPage('button');
      button.focus();
      sheet.snapTo('half');
      await settle();
      const root: HTMLElement = fixture.nativeElement;

      fixture.destroy();

      expect(root.hasAttribute('inert')).toBe(false);
      expect(document.activeElement).toBe(button);
    });

    it('leaves an element that was already inert inert', async () => {
      const sibling = addToPage('div');
      sibling.setAttribute('inert', '');
      sheet.snapTo('half');
      await settle();

      pressEscape();
      await settle();

      expect(host.detent()).toBe('lip');
      expect(sibling.hasAttribute('inert')).toBe(true);
    });
  });
});
