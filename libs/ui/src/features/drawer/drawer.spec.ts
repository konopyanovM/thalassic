import { Direction, Directionality } from '@angular/cdk/bidi';
import { ApplicationRef, Component, viewChild } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { MOTION_ATTRIBUTE, PanEvent } from '@thalassic/core';
import { DrawerSharedDirective } from './drawer-shared.directive';
import { DrawerTriggerDirective } from './drawer-trigger.directive';
import { DrawerRef } from './drawer-ref';
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

@Component({
  imports: [DrawerSharedDirective],
  template: '<h2 tlsDrawerShared="title">Session</h2><p>Drawer content</p>',
})
class SharedTitleContentComponent {}

@Component({
  imports: [DrawerTriggerDirective],
  template: '<button type="button" tlsDrawerTrigger>Open</button>',
})
class TriggerHostComponent {
  public readonly trigger = viewChild.required(DrawerTriggerDirective);
}

// An animation as the Web Animations API hands one back, already over — what
// the drawer keeps of its entrance and looks at on close.
function finishedAnimation(): Animation {
  return {
    playState: 'finished',
    effect: null,
    cancel: () => undefined,
    pause: () => undefined,
    reverse: () => undefined,
  } as unknown as Animation;
}

@Component({
  imports: [DrawerTriggerDirective],
  template: `<button type="button" tlsDrawerTrigger dragToOpen #trigger="tlsDrawerTrigger"
    (openRequest)="open(trigger)">Open</button>`,
})
class DraggableTriggerHostComponent {
  public drawerRef: DrawerRef<unknown, DrawerContentComponent> | null = null;

  public open(trigger: DrawerTriggerDirective): void {
    this.drawerRef = trigger.open(DrawerContentComponent, { side: 'bottom' });
  }
}

function box(top: number, right: number, bottom: number, left: number): DOMRect {
  return {
    top,
    right,
    bottom,
    left,
    width: right - left,
    height: bottom - top,
    x: left,
    y: top,
    toJSON: () => ({}),
  } as DOMRect;
}

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

  describe('grabber', () => {
    it('shows on a bottom sheet by default', () => {
      service.open(DrawerContentComponent, { side: 'bottom' });
      flush();

      expect(document.querySelector('.tls-drawer__grabber')).not.toBeNull();
    });

    it('stays off a side panel by default', () => {
      service.open(DrawerContentComponent, { side: 'end' });
      flush();

      expect(document.querySelector('.tls-drawer__grabber')).toBeNull();
    });

    it('can be turned off on a bottom sheet', () => {
      service.open(DrawerContentComponent, { side: 'bottom', grabber: false });
      flush();

      expect(document.querySelector('.tls-drawer__grabber')).toBeNull();
    });
  });

  describe('origin', () => {
    let animate: ReturnType<typeof vi.fn>;

    beforeEach(() => {
      document.documentElement.setAttribute(MOTION_ATTRIBUTE, 'essential');
      // jsdom has no Web Animations API; a stub records what was asked of it.
      animate = vi.fn(finishedAnimation);
      HTMLElement.prototype.animate = animate as unknown as HTMLElement['animate'];
    });

    afterEach(() => {
      service.closeAll();
      document.documentElement.removeAttribute(MOTION_ATTRIBUTE);
      Reflect.deleteProperty(HTMLElement.prototype, 'animate');
    });

    function originInsidePanel(): HTMLElement {
      const origin = document.createElement('button');
      document.body.appendChild(origin);
      origin.getBoundingClientRect = () => box(340, 100, 400, 0);
      return origin;
    }

    it('slides the panel out from an origin it covers', () => {
      const origin = originInsidePanel();
      service.open(DrawerContentComponent, { side: 'bottom', origin });

      const element = drawerElement();
      expect(element).not.toBeNull();
      if (element === null) return;
      element.getBoundingClientRect = () => box(0, 100, 400, 0);
      flush();

      expect(element.classList).toContain('tls-drawer--scripted');
      const [keyframes] = animate.mock.calls[0] as [Keyframe[]];
      expect(keyframes).toEqual([
        { transform: 'translate(0px, 340px)' },
        { transform: 'translate(0px, 0px)' },
      ]);
      origin.remove();
    });

    it('carries a shared element over from its partner in the origin', () => {
      const origin = originInsidePanel();
      const partner = document.createElement('strong');
      partner.setAttribute('data-tls-drawer-shared', 'title');
      origin.appendChild(partner);
      partner.getBoundingClientRect = () => box(350, 60, 370, 16);

      service.open(SharedTitleContentComponent, { side: 'bottom', origin });
      const element = drawerElement();
      expect(element).not.toBeNull();
      if (element === null) return;
      element.getBoundingClientRect = () => box(0, 100, 400, 0);
      const title = element.querySelector<HTMLElement>('h2');
      expect(title).not.toBeNull();
      if (title === null) return;
      // As in a browser, the title's box moves with the panel once the panel's
      // animation is running, so it must be read before that starts.
      let panelAnimated = false;
      animate.mockImplementation(function (this: Element) {
        if (this === element) panelAnimated = true;
        return finishedAnimation();
      });
      title.getBoundingClientRect = () =>
        panelAnimated ? box(360, 80, 384, 16) : box(20, 80, 44, 16);
      flush();

      // The panel starts 340px down, so the title needs 350 − (20 + 340) = −10px
      // of its own to land on its partner.
      const titleCall = animate.mock.contexts.indexOf(title);
      expect(titleCall).toBeGreaterThanOrEqual(0);
      const [keyframes] = animate.mock.calls[titleCall] as [Keyframe[]];
      expect(keyframes[0]['transform']).toBe('translate(0px, -10px) scale(1)');
      origin.remove();
    });

    it('plays a slide still under way back into the origin when closed', async () => {
      const origin = originInsidePanel();
      const entrance = {
        playState: 'running',
        effect: { updateTiming: vi.fn() },
        reverse: vi.fn(),
        cancel: () => undefined,
      };
      animate.mockImplementation(() => entrance);
      const drawerRef = service.open(DrawerContentComponent, { side: 'bottom', origin });
      const closed = vi.fn();
      drawerRef.closed.subscribe(closed);

      const element = drawerElement();
      expect(element).not.toBeNull();
      if (element === null) return;
      element.getBoundingClientRect = () => box(0, 100, 400, 0);
      flush();

      drawerRef.close();
      await settle();

      // Reversed from where it had got to, held at the end — not measured
      // mid-flight and slid again from rest.
      expect(entrance.effect.updateTiming).toHaveBeenCalledWith({ fill: 'both' });
      expect(entrance.reverse).toHaveBeenCalled();
      expect(closed).toHaveBeenCalled();
      origin.remove();
    });

    it('slides instead when the origin lies outside the panel', () => {
      const origin = document.createElement('button');
      document.body.appendChild(origin);
      origin.getBoundingClientRect = () => box(500, 100, 540, 0);
      service.open(DrawerContentComponent, { side: 'bottom', origin });

      const element = drawerElement();
      expect(element).not.toBeNull();
      if (element === null) return;
      element.getBoundingClientRect = () => box(0, 100, 400, 0);
      flush();

      expect(element.classList).not.toContain('tls-drawer--scripted');
      expect(animate).not.toHaveBeenCalled();
      origin.remove();
    });

    it('slides back over the origin, then disposes', async () => {
      const origin = originInsidePanel();
      const drawerRef = service.open(DrawerContentComponent, { side: 'bottom', origin });
      const closed = vi.fn();
      drawerRef.closed.subscribe(closed);

      const element = drawerElement();
      expect(element).not.toBeNull();
      if (element === null) return;
      element.getBoundingClientRect = () => box(0, 100, 400, 0);
      flush();

      drawerRef.close();
      await settle();

      const [keyframes] = animate.mock.lastCall as [Keyframe[]];
      expect(keyframes).toEqual([
        { transform: 'translate(0px, 0px)' },
        { transform: 'translate(0px, 340px)' },
      ]);
      expect(closed).toHaveBeenCalled();
      origin.remove();
    });
  });

  describe('open by drag', () => {
    // A stand-in for the Web Animations API that keeps what the gesture sets,
    // down to the trait that matters on close: a paused animation's `finished`
    // never settles, as in a browser.
    interface FakeAnimation {
      element: Element;
      keyframes: Keyframe[];
      currentTime: number | null;
      playState: AnimationPlayState;
      readonly finished: Promise<void>;
      effect: { getComputedTiming: () => { endTime: number } };
      pause: () => void;
      cancel: () => void;
    }
    let animations: FakeAnimation[];

    beforeEach(() => {
      animations = [];
      HTMLElement.prototype.animate = function (this: Element, keyframes: Keyframe[]) {
        const animation: FakeAnimation = {
          element: this,
          keyframes,
          currentTime: 0,
          playState: 'running',
          get finished(): Promise<void> {
            return this.playState === 'paused' ? new Promise<void>(() => undefined) : Promise.resolve();
          },
          effect: { getComputedTiming: () => ({ endTime: 1 }) },
          pause() {
            this.playState = 'paused';
          },
          cancel() {
            this.playState = 'idle';
          },
        };
        animations.push(animation);
        return animation as unknown as Animation;
      } as unknown as HTMLElement['animate'];
      HTMLElement.prototype.getAnimations = function (this: Element) {
        return animations.filter(
          animation => animation.element === this && animation.playState !== 'idle',
        ) as unknown as Animation[];
      };
    });

    // Drawers still open close while the stubs stand: a close mid-drag
    // settles the gesture, which animates.
    afterEach(() => {
      service.closeAll();
      Reflect.deleteProperty(HTMLElement.prototype, 'animate');
      Reflect.deleteProperty(HTMLElement.prototype, 'getAnimations');
    });

    function dragEvent(deltaY: number, velocityY = 0): PanEvent {
      return { deltaX: 0, deltaY, velocityX: 0, velocityY } as PanEvent;
    }

    function openUnderDrag() {
      const drawerRef = service.open(DrawerContentComponent, { side: 'bottom', openByDrag: true });
      const element = drawerElement();
      if (element !== null) element.getBoundingClientRect = () => box(0, 100, 400, 0);
      flush();
      return drawerRef;
    }

    it('follows the finger along the slide', () => {
      const drawerRef = openUnderDrag();

      // Off-screen at the start, the panel is 400px from open; 100px up is a quarter.
      drawerRef.followOpenDrag(dragEvent(-100));

      expect(animations[0].keyframes[0]).toEqual({ transform: 'translate(0px, 400px)' });
      expect(animations[0].currentTime).toBe(0.25);
    });

    it('settles open when released past the ratio', async () => {
      const drawerRef = openUnderDrag();
      const closed = vi.fn();
      drawerRef.closed.subscribe(closed);

      drawerRef.followOpenDrag(dragEvent(-300));
      drawerRef.releaseOpenDrag(dragEvent(-300));
      await settle();

      expect(closed).not.toHaveBeenCalled();
      expect(document.querySelector('.tls-drawer--open')).not.toBeNull();
    });

    it('settles back closed, and disposes, when released short', async () => {
      const drawerRef = openUnderDrag();
      const closed = vi.fn();
      drawerRef.closed.subscribe(closed);

      drawerRef.followOpenDrag(dragEvent(-60));
      drawerRef.releaseOpenDrag(dragEvent(-60));
      await settle();

      expect(closed).toHaveBeenCalled();
    });

    it('opens on an upward flick however short the drag', async () => {
      const drawerRef = openUnderDrag();
      const closed = vi.fn();
      drawerRef.closed.subscribe(closed);

      drawerRef.followOpenDrag(dragEvent(-40));
      drawerRef.releaseOpenDrag(dragEvent(-40, -1));
      await settle();

      expect(closed).not.toHaveBeenCalled();
    });

    it('closes when asked to mid-drag, instead of waiting on the paused drag', async () => {
      const drawerRef = openUnderDrag();
      const closed = vi.fn();
      drawerRef.closed.subscribe(closed);

      drawerRef.followOpenDrag(dragEvent(-100));
      drawerRef.close();
      await settle();

      expect(closed).toHaveBeenCalled();
    });

    it('closes once it has settled open, when asked to on the way', async () => {
      const drawerRef = openUnderDrag();
      const closed = vi.fn();
      drawerRef.closed.subscribe(closed);

      drawerRef.followOpenDrag(dragEvent(-300));
      drawerRef.releaseOpenDrag(dragEvent(-300));
      drawerRef.close();
      await settle();

      expect(closed).toHaveBeenCalled();
    });

    it('settles closed when its trigger goes away mid-drag', async () => {
      const fixture = TestBed.createComponent(DraggableTriggerHostComponent);
      fixture.detectChanges();
      const button: HTMLButtonElement = fixture.nativeElement.querySelector('button');
      button.getBoundingClientRect = () => box(340, 100, 400, 0);

      button.dispatchEvent(createPointerEvent('pointerdown', { x: 50, y: 370, timeStamp: 0 }));
      document.dispatchEvent(createPointerEvent('pointermove', { x: 50, y: 320, timeStamp: 50 }));
      document.dispatchEvent(createPointerEvent('pointermove', { x: 50, y: 270, timeStamp: 100 }));
      const element = drawerElement();
      expect(element).not.toBeNull();
      if (element !== null) element.getBoundingClientRect = () => box(0, 100, 400, 0);
      flush();

      const drawerRef = fixture.componentInstance.drawerRef;
      expect(drawerRef).not.toBeNull();
      if (drawerRef === null) return;
      const closed = vi.fn();
      drawerRef.closed.subscribe(closed);

      fixture.destroy();
      await settle();

      expect(closed).toHaveBeenCalled();
    });

    it('closes when the drag is cancelled', async () => {
      const drawerRef = openUnderDrag();
      const closed = vi.fn();
      drawerRef.closed.subscribe(closed);

      drawerRef.followOpenDrag(dragEvent(-300));
      drawerRef.releaseOpenDrag(null);
      await settle();

      expect(closed).toHaveBeenCalled();
    });
  });

  describe('trigger', () => {
    it('announces the drawer it opens, and whether it is open', async () => {
      const fixture = TestBed.createComponent(TriggerHostComponent);
      fixture.detectChanges();
      const button: HTMLButtonElement = fixture.nativeElement.querySelector('button');

      expect(button.getAttribute('aria-haspopup')).toBe('dialog');
      expect(button.getAttribute('aria-expanded')).toBe('false');

      const drawerRef = fixture.componentInstance.trigger().open(DrawerContentComponent);
      fixture.detectChanges();
      expect(button.getAttribute('aria-expanded')).toBe('true');

      drawerRef.close();
      await settle();
      fixture.detectChanges();
      expect(button.getAttribute('aria-expanded')).toBe('false');
    });

    it('points at the drawer it opened while that is open', () => {
      const fixture = TestBed.createComponent(TriggerHostComponent);
      fixture.detectChanges();
      const button: HTMLButtonElement = fixture.nativeElement.querySelector('button');

      fixture.componentInstance.trigger().open(DrawerContentComponent);
      fixture.detectChanges();

      const element = drawerElement();
      expect(element).not.toBeNull();
      if (element === null) return;
      expect(button.getAttribute('aria-controls')).toBe(element.id);
      expect(element.id).not.toBe('');
    });
  });
});
