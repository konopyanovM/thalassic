import { Direction, Directionality } from '@angular/cdk/bidi';
import { ApplicationRef, Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { DrawerService } from './drawer.service';
import { drawerSide } from './drawer.types';

interface PointerOptions {
  x: number;
  y: number;
  timeStamp?: number;
}

// jsdom ships no full PointerEvent implementation, so pointer events are built
// from MouseEvent with the pointer fields (and a controllable timeStamp, which
// the gesture's velocity window depends on) defined on the instance.
function createPointerEvent(type: string, options: PointerOptions): PointerEvent {
  const event = new MouseEvent(type, {
    bubbles: true,
    cancelable: true,
    clientX: options.x,
    clientY: options.y,
    button: 0,
  });

  Object.defineProperties(event, {
    pointerId: { value: 1 },
    pointerType: { value: 'touch' },
    isPrimary: { value: true },
    timeStamp: { value: options.timeStamp ?? 0 },
  });

  return event as unknown as PointerEvent;
}

@Component({ template: '<p>Drawer content</p>' })
class DrawerContentComponent {}

const PANEL_EXTENT = 400;

describe('DrawerService', () => {
  let service: DrawerService;

  beforeEach(async () => {
    await TestBed.configureTestingModule({}).compileComponents();
    service = TestBed.inject(DrawerService);

    Element.prototype.setPointerCapture = () => undefined;
    Element.prototype.releasePointerCapture = () => undefined;
    Element.prototype.hasPointerCapture = () => true;
  });

  afterEach(() => {
    service.closeAll();
    useDirection('ltr');
  });

  // CDK resolves the layout direction once, into a root-provided `Directionality`
  // that the drawer and its position strategy both read, so a test flips that
  // rather than the `dir` attribute it was seeded from.
  function useDirection(direction: Direction): void {
    TestBed.inject(Directionality).valueSignal.set(direction);
  }

  // Drives the render hooks the drawer's settle depends on: the settle class has
  // to reach the DOM before the drag offset is written, which `afterNextRender`
  // sequences.
  function flush(): void {
    TestBed.inject(ApplicationRef).tick();
  }

  // Both dismissal paths hand off through a frame — the slide-out waits on an
  // animation frame, the drag settle on a render hook — so a closure is only
  // observable after one has passed.
  async function settle(): Promise<void> {
    flush();
    await new Promise<void>(resolve => setTimeout(resolve, 32));
    flush();
  }

  function drawerElement(): HTMLElement | null {
    return document.querySelector('tls-drawer');
  }

  // jsdom lays nothing out, so the panel reports a zero box and the drag would
  // have no extent to measure its progress against.
  function stubPanelExtent(element: HTMLElement, side: drawerSide): void {
    const isInline = side === 'start' || side === 'end';
    element.getBoundingClientRect = () =>
      ({
        width: isInline ? PANEL_EXTENT : 100,
        height: isInline ? 100 : PANEL_EXTENT,
        top: 0,
        left: 0,
        right: isInline ? PANEL_EXTENT : 100,
        bottom: isInline ? 100 : PANEL_EXTENT,
        x: 0,
        y: 0,
        toJSON: () => ({}),
      }) as DOMRect;
  }

  // Plays a complete gesture on the panel: press, a move past the gesture's slop
  // to lock the axis, a move to `travel`, then release.
  function dragPanel(element: HTMLElement, travel: { x: number; y: number }): void {
    const steps = [
      createPointerEvent('pointerdown', { x: 0, y: 0, timeStamp: 0 }),
      createPointerEvent('pointermove', {
        x: Math.sign(travel.x) * 20,
        y: Math.sign(travel.y) * 20,
        timeStamp: 100,
      }),
      createPointerEvent('pointermove', { x: travel.x, y: travel.y, timeStamp: 600 }),
      createPointerEvent('pointerup', { x: travel.x, y: travel.y, timeStamp: 700 }),
    ];

    element.dispatchEvent(steps[0]);
    for (const step of steps.slice(1)) document.dispatchEvent(step);
  }

  it('should create', () => {
    expect(service).toBeTruthy();
  });

  describe('dismissal wiring', () => {
    it('closes on Escape even when backdrop dismissal is off', async () => {
      const drawerRef = service.open(DrawerContentComponent, { backdropClose: false });
      const closed = vi.fn();
      drawerRef.closed.subscribe(closed);

      document.body.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));
      await settle();

      expect(closed).toHaveBeenCalled();
    });

    it('leaves Escape inert when escape dismissal is off', async () => {
      const drawerRef = service.open(DrawerContentComponent, { escapeClose: false });
      const closed = vi.fn();
      drawerRef.closed.subscribe(closed);

      document.body.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));
      await settle();

      expect(closed).not.toHaveBeenCalled();
    });
  });

  describe('drag gesture wiring', () => {
    it('carries no gesture without a grabber', async () => {
      const drawerRef = service.open(DrawerContentComponent, {
        side: 'bottom',
        grabber: false,
      });
      const closed = vi.fn();
      drawerRef.closed.subscribe(closed);
      flush();

      const element = drawerElement();
      expect(element).not.toBeNull();
      if (element === null) return;

      stubPanelExtent(element, 'bottom');
      dragPanel(element, { x: 0, y: PANEL_EXTENT * 0.6 });
      await settle();

      expect(closed).not.toHaveBeenCalled();
    });

    it('ignores travel across the panel axis', async () => {
      const drawerRef = service.open(DrawerContentComponent, { side: 'bottom', grabber: true });
      const closed = vi.fn();
      drawerRef.closed.subscribe(closed);
      flush();

      const element = drawerElement();
      expect(element).not.toBeNull();
      if (element === null) return;

      // A bottom sheet locks to the block axis, so a horizontal sweep belongs to
      // the browser and must leave the panel alone.
      stubPanelExtent(element, 'bottom');
      dragPanel(element, { x: PANEL_EXTENT * 0.6, y: 0 });
      await settle();

      expect(closed).not.toHaveBeenCalled();
    });
  });

  describe('drag to dismiss', () => {
    it('dismisses a bottom sheet dragged past the ratio', async () => {
      const drawerRef = service.open(DrawerContentComponent, { side: 'bottom', grabber: true });
      const closed = vi.fn();
      drawerRef.closed.subscribe(closed);
      flush();

      const element = drawerElement();
      expect(element).not.toBeNull();
      if (element === null) return;

      stubPanelExtent(element, 'bottom');
      dragPanel(element, { x: 0, y: PANEL_EXTENT * 0.6 });
      await settle();

      expect(closed).toHaveBeenCalled();
    });

    it('snaps back from a short, slow drag', async () => {
      const drawerRef = service.open(DrawerContentComponent, { side: 'bottom', grabber: true });
      const closed = vi.fn();
      drawerRef.closed.subscribe(closed);
      flush();

      const element = drawerElement();
      expect(element).not.toBeNull();
      if (element === null) return;

      stubPanelExtent(element, 'bottom');
      dragPanel(element, { x: 0, y: PANEL_EXTENT * 0.1 });
      await settle();

      expect(closed).not.toHaveBeenCalled();
      expect(element.style.getPropertyValue('--tls-drawer-drag')).toBe('0px');
    });

    it('ignores a drag away from the pinned edge', async () => {
      const drawerRef = service.open(DrawerContentComponent, { side: 'bottom', grabber: true });
      const closed = vi.fn();
      drawerRef.closed.subscribe(closed);
      flush();

      const element = drawerElement();
      expect(element).not.toBeNull();
      if (element === null) return;

      stubPanelExtent(element, 'bottom');
      dragPanel(element, { x: 0, y: -PANEL_EXTENT * 0.6 });
      await settle();

      expect(closed).not.toHaveBeenCalled();
    });

    it('mirrors the dismiss direction in RTL', async () => {
      useDirection('rtl');

      // An `end` panel is pinned to the left in RTL, so travel to the *left* is
      // what carries it off-screen.
      const drawerRef = service.open(DrawerContentComponent, { side: 'end', grabber: true });
      const closed = vi.fn();
      drawerRef.closed.subscribe(closed);
      flush();

      const element = drawerElement();
      expect(element).not.toBeNull();
      if (element === null) return;

      stubPanelExtent(element, 'end');
      dragPanel(element, { x: -PANEL_EXTENT * 0.6, y: 0 });
      await settle();

      expect(closed).toHaveBeenCalled();
    });
  });
});
