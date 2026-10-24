import { InputModalityDetector } from '@angular/cdk/a11y';
import { OverlayContainer } from '@angular/cdk/overlay';
import { ApplicationRef, Component, signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
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
      [panelClass]="panelClass()"
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
  /** A signal, so a write from the test marks this OnPush host for check. */
  readonly detent = signal('lip');
  readonly panelClass = signal<string | string[] | undefined>('page-pane');
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
  // 30% of the 800px viewport, and 20rem through the probe, which measures
  // nothing but the `20rem` detent.
  function stubSizes(): void {
    Object.defineProperty(query('.tls-sheet__header'), 'offsetHeight', {
      value: 80,
      configurable: true,
    });
    Object.defineProperty(query('.tls-sheet__content'), 'offsetHeight', {
      value: 300,
      configurable: true,
    });
    Object.defineProperty(query('.tls-sheet__probe'), 'offsetHeight', {
      value: 320,
      configurable: true,
    });
    Object.defineProperty(document.documentElement, 'clientHeight', {
      value: 800,
      configurable: true,
    });
  }

  // Whether the root carries a motion state class; change detection first,
  // since the classes are bindings.
  function isMoving(): boolean {
    fixture.detectChanges();
    const root = query('.tls-sheet');
    return (
      root.classList.contains('tls-sheet--dragging') ||
      root.classList.contains('tls-sheet--settling')
    );
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

  it('carries a class the page names on its pane, beside its own', () => {
    const pane = query('.cdk-overlay-pane');
    expect(pane.classList.contains('page-pane')).toBe(true);
    expect(pane.classList.contains('tls-sheet-pane')).toBe(true);
  });

  it('swaps the named classes on its pane when they change and keeps its own', () => {
    host.panelClass.set(['tinted', 'is-wide']);
    fixture.detectChanges();

    const pane = query('.cdk-overlay-pane');
    expect(pane.classList.contains('page-pane')).toBe(false);
    expect(pane.classList.contains('tinted')).toBe(true);
    expect(pane.classList.contains('is-wide')).toBe(true);
    expect(pane.classList.contains('tls-sheet-pane')).toBe(true);
  });

  it('keeps its own pane class when the page names it and then drops it', () => {
    host.panelClass.set('tls-sheet-pane');
    fixture.detectChanges();
    host.panelClass.set(undefined);
    fixture.detectChanges();

    expect(query('.cdk-overlay-pane').classList.contains('tls-sheet-pane')).toBe(true);
  });

  it('rests at the first detent and publishes its height for the page', () => {
    expect(host.detent()).toBe('lip');
    expect(document.documentElement.style.getPropertyValue('--tls-sheet-collapsed-size')).toBe(
      '80px',
    );
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

  it('marks the root as collapsed only at the first detent', async () => {
    const root = query('.tls-sheet');
    expect(root.classList.contains('tls-sheet--collapsed')).toBe(true);

    sheet.snapTo('half');
    await settle();
    expect(root.classList.contains('tls-sheet--collapsed')).toBe(false);

    sheet.snapTo('lip');
    await settle();
    expect(root.classList.contains('tls-sheet--collapsed')).toBe(true);
  });

  it('marks the root as bound for the lip from the moment a collapse begins', async () => {
    const root = query('.tls-sheet');
    expect(root.classList.contains('tls-sheet--lip')).toBe(true);

    sheet.snapTo('half');
    fixture.detectChanges();
    expect(root.classList.contains('tls-sheet--lip')).toBe(false);
    await settle();

    sheet.snapTo('lip');
    fixture.detectChanges();
    // Still settled at `half`, already heading for the lip.
    expect(root.classList.contains('tls-sheet--collapsed')).toBe(false);
    expect(root.classList.contains('tls-sheet--lip')).toBe(true);
    await settle();
    expect(root.classList.contains('tls-sheet--lip')).toBe(true);
  });

  it('removes the published height and the pane on destroy', async () => {
    fixture.destroy();

    expect(document.documentElement.style.getPropertyValue('--tls-sheet-collapsed-size')).toBe('');
    await vi.waitFor(() => expect(container.querySelector('.tls-sheet-pane')).toBeNull());
  });

  it('moves to the first detent and rewrites the model when the page writes an unknown id', async () => {
    sheet.snapTo('full');
    await settle();

    host.detent.set('nowhere');
    fixture.detectChanges();
    await settle();

    expect(host.detent()).toBe('lip');
    expect(panelOffset()).toBe('240px');
  });

  describe('drag', () => {
    // Where every drag presses down; travel is measured from here.
    const pressY = 400;

    interface TouchDrag {
      /** Moves to `travel` px from the press, `after` ms past the previous event. */
      move(travel: number, after?: number): void;
      /** Lifts the finger where it rests, `after` ms past the previous event. */
      release(after?: number): void;
      cancel(): void;
    }

    // jsdom ships no full PointerEvent implementation, so pointer events are
    // built from MouseEvent with the pointer fields (and a controllable
    // timeStamp, which the release velocity depends on) defined on the instance.
    function dispatchPointer(type: string, target: Element, y: number, timeStamp: number): void {
      const event = new MouseEvent(type, {
        bubbles: true,
        cancelable: true,
        clientX: 0,
        clientY: y,
        button: 0,
      });
      Object.defineProperties(event, {
        pointerId: { value: 1 },
        pointerType: { value: 'touch' },
        isPrimary: { value: true },
        timeStamp: { value: timeStamp },
      });
      target.dispatchEvent(event);
    }

    // A touch pressed on `target`, driving the sheet's own pan gesture.
    function touch(target: Element = query('.tls-sheet__header')): TouchDrag {
      let time = 0;
      let y = pressY;
      dispatchPointer('pointerdown', target, y, time);

      return {
        move(travel: number, after = 10): void {
          time += after;
          y = pressY + travel;
          dispatchPointer('pointermove', target, y, time);
        },
        release(after = 0): void {
          time += after;
          dispatchPointer('pointerup', target, y, time);
        },
        cancel(): void {
          dispatchPointer('pointercancel', target, y, time);
        },
      };
    }

    beforeEach(() => {
      // jsdom implements no pointer capture; the gesture only needs the calls to
      // succeed.
      Element.prototype.setPointerCapture = () => undefined;
      Element.prototype.releasePointerCapture = () => undefined;
      Element.prototype.hasPointerCapture = () => true;
    });

    afterEach(() => {
      Reflect.deleteProperty(Element.prototype, 'setPointerCapture');
      Reflect.deleteProperty(Element.prototype, 'releasePointerCapture');
      Reflect.deleteProperty(Element.prototype, 'hasPointerCapture');
    });

    it('follows the finger between detents and settles on the nearest past the ratio', async () => {
      const drag = touch();
      drag.move(-10);
      expect(isMoving()).toBe(true);

      drag.move(-100);
      // From 80px up 100 = 180px tall: offset = 320 − 180.
      expect(panelOffset()).toBe('140px');

      // Released at 230px: past 40% of the 80→240 gap, and nearer 240 than 320.
      // Held still first, so the release carries no velocity.
      drag.move(-150);
      drag.release(500);
      await settle();

      expect(host.detent()).toBe('half');
    });

    it('steps one detent on a flick however short the drag', async () => {
      const drag = touch();
      drag.move(-10, 5);
      drag.move(-12, 7);
      drag.release();
      await settle();

      expect(host.detent()).toBe('half');
    });

    it('snaps back on cancel', async () => {
      const drag = touch();
      drag.move(-10);
      drag.move(-150);
      drag.cancel();
      await settle();

      expect(host.detent()).toBe('lip');
      expect(panelOffset()).toBe('240px');
    });

    it('rubber-bands below the smallest detent and holds at the largest', () => {
      const drag = touch();
      drag.move(10);
      drag.move(60);
      // 60px below the lip: a third of the overshoot on top of the full travel.
      expect(panelOffset()).toBe('260px');

      drag.move(600);
      expect(panelOffset()).toBe('272px');

      drag.move(-900);
      expect(panelOffset()).toBe('0px');
    });

    it('leaves a pan inside a scrolled body to the body at the top detent', async () => {
      sheet.snapTo('full');
      await settle();
      const body = query('.tls-sheet__body');
      Object.defineProperty(body, 'scrollTop', { value: 40, configurable: true });

      const drag = touch(body);
      drag.move(20);

      expect(isMoving()).toBe(false);
      drag.move(80);
      expect(panelOffset()).toBe('0px');
    });

    it('takes a downward pan inside the body once the body is at its top', async () => {
      sheet.snapTo('full');
      await settle();
      const body = query('.tls-sheet__body');
      Object.defineProperty(body, 'scrollTop', { value: 0, configurable: true });

      touch(body).move(20);

      expect(isMoving()).toBe(true);
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
      vi.restoreAllMocks();
    });

    // Stands in for the most recent interaction having been a touch.
    function mockTouchModality(): void {
      const detector = TestBed.inject(InputModalityDetector);
      vi.spyOn(detector, 'mostRecentModality', 'get').mockReturnValue('touch');
    }

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

    it('does not move focus when a pointer put the sheet into modal', async () => {
      mockTouchModality();

      sheet.snapTo('half');
      await settle();

      expect(fixture.nativeElement.hasAttribute('inert')).toBe(true);
      expect(document.activeElement).not.toBe(query('.tls-sheet__header'));
      expect(document.activeElement).toBe(document.body);
    });

    it('does not move focus back to the header when a pointer collapsed it', async () => {
      sheet.snapTo('half');
      await settle();
      expect(document.activeElement).toBe(query('.tls-sheet__header'));
      // Focus off the header onto `body`, where a pointer user's rests, so a
      // return to the header is what the test would see.
      query('.tls-sheet__header').blur();
      mockTouchModality();

      pressEscape();
      await settle();

      expect(host.detent()).toBe('lip');
      expect(document.activeElement).not.toBe(query('.tls-sheet__header'));
      expect(fixture.nativeElement.hasAttribute('inert')).toBe(false);
    });

    it('leaves focus that has moved outside the sheet where it is when leaving modal', async () => {
      sheet.snapTo('half');
      await settle();
      // Stands in for a dialog the page opens as it collapses the sheet. It sits
      // in an overlay pane, as a real one does: the modal focus trap reclaims
      // focus from anything outside the panel that is not in a pane.
      const pane = document.createElement('div');
      pane.classList.add('cdk-overlay-pane');
      container.appendChild(pane);
      added.push(pane);
      const button = document.createElement('button');
      pane.appendChild(button);
      button.focus();
      expect(document.activeElement).toBe(button);

      sheet.snapTo('lip');
      await settle();

      expect(host.detent()).toBe('lip');
      expect(document.activeElement).toBe(button);
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
