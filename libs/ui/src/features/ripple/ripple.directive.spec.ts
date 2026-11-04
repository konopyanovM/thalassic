import { Component, signal } from '@angular/core';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { pointerType } from '../../types';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MOTION_ATTRIBUTE, motionLevel } from '@thalassic/core';
import { DEFAULT_RIPPLE_CONFIG } from './ripple.config';
import { RippleDirective } from './ripple.directive';
import { RIPPLE_CONFIG } from './ripple.token';
import {
  PRESS_SCALE_PROPERTY,
  RIPPLE_ACTIVE_CLASS,
  RIPPLE_DIAMETER_PROPERTY,
  RIPPLE_MOVE_SLOP_PX,
  RIPPLE_RELEASED_CLASS,
  RIPPLE_TOUCH_DELAY_MS,
  RIPPLE_X_PROPERTY,
  RIPPLE_Y_PROPERTY,
} from './ripple.constants';

@Component({
  imports: [RippleDirective],
  template: `<button
    tlsRipple
    [rippleDisabled]="rippleDisabled()"
    [ripplePointerTypes]="pointerTypes()"
    [disabled]="disabled()"
  >press</button>`,
})
class RippleHost {
  public readonly rippleDisabled = signal(false);
  public readonly disabled = signal(false);
  public readonly pointerTypes = signal<pointerType[] | undefined>(undefined);
}

describe('RippleDirective', () => {
  let fixture: ComponentFixture<RippleHost>;
  let host: HTMLButtonElement;

  /** The host is 200×50 at the viewport origin, so contact points are readable. */
  const BOUNDS = { left: 0, top: 0, width: 200, height: 50 } as DOMRect;

  function pointerDown(overrides: Partial<PointerEventInit> = {}): void {
    host.dispatchEvent(
      new PointerEvent('pointerdown', {
        pointerType: 'touch',
        clientX: 50,
        clientY: 25,
        bubbles: true,
        ...overrides,
      }),
    );
  }

  /**
   * A touch held past the wait, so its ink has been struck. Timers are faked only from the
   * first press on: settling the fixture waits on a real timer, which a fake one would stall.
   */
  function press(overrides: Partial<PointerEventInit> = {}): void {
    vi.useFakeTimers();
    pointerDown(overrides);
    vi.advanceTimersByTime(RIPPLE_TOUCH_DELAY_MS);
  }

  function setMotion(level: motionLevel): void {
    document.documentElement.setAttribute(MOTION_ATTRIBUTE, level);
  }

  afterEach(() => {
    document.documentElement.removeAttribute(MOTION_ATTRIBUTE);
    vi.useRealTimers();
  });

  beforeEach(async () => {
    setMotion('full');

    await TestBed.configureTestingModule({
      imports: [RippleHost],
    }).compileComponents();

    fixture = TestBed.createComponent(RippleHost);
    await fixture.whenStable();

    host = fixture.nativeElement.querySelector('button');
    // jsdom lays nothing out, so the box the ink is measured against is pinned here.
    host.getBoundingClientRect = () => BOUNDS;
  });

  it('inks from the contact point on touch', () => {
    press({ clientX: 50, clientY: 25 });

    expect(host.classList.contains(RIPPLE_ACTIVE_CLASS)).toBe(true);
    expect(host.style.getPropertyValue(RIPPLE_X_PROPERTY)).toBe('50px');
    expect(host.style.getPropertyValue(RIPPLE_Y_PROPERTY)).toBe('25px');
  });

  it('reaches the farthest corner from an off-centre contact', () => {
    // Struck 50px in on a 200×50 box: the far corner is 150 across and 25 down.
    press({ clientX: 50, clientY: 25 });

    const expected = Math.hypot(150, 25);
    expect(parseFloat(host.style.getPropertyValue(RIPPLE_DIAMETER_PROPERTY))).toBeCloseTo(expected, 3);
  });

  it('stands the press down for the interaction it inks', () => {
    pointerDown();
    expect(host.style.getPropertyValue(PRESS_SCALE_PROPERTY)).toBe('1');
  });

  it('holds the press suppressed past release, since `:active` outlives the contact', () => {
    pointerDown();
    host.dispatchEvent(new PointerEvent('pointerup', { bubbles: true }));

    // Lifting it here would hand the control to a press that is still matching,
    // depressing it after the finger has gone.
    expect(host.style.getPropertyValue(PRESS_SCALE_PROPERTY)).toBe('1');
  });

  it('leaves a mouse press to the press effect', () => {
    pointerDown({ pointerType: 'mouse' });

    expect(host.classList.contains(RIPPLE_ACTIVE_CLASS)).toBe(false);
    expect(host.style.getPropertyValue(PRESS_SCALE_PROPERTY)).toBe('');
  });

  it('restores the press when a mouse takes over from a touch', () => {
    pointerDown({ pointerType: 'touch' });
    expect(host.style.getPropertyValue(PRESS_SCALE_PROPERTY)).toBe('1');

    pointerDown({ pointerType: 'mouse' });
    expect(host.style.getPropertyValue(PRESS_SCALE_PROPERTY)).toBe('');
  });

  it('inks for a pen, which occludes like a finger', () => {
    pointerDown({ pointerType: 'pen' });

    expect(host.classList.contains(RIPPLE_ACTIVE_CLASS)).toBe(true);
  });

  it('leaves reduced motion to the press effect', () => {
    // A touch that inked at `full` must hand the press back if the level drops.
    press();
    setMotion('essential');
    pointerDown();

    expect(host.classList.contains(RIPPLE_ACTIVE_CLASS)).toBe(false);
    // The press must survive, since it is the acknowledgement at this level.
    expect(host.style.getPropertyValue(PRESS_SCALE_PROPERTY)).toBe('');
  });

  it('inks nothing at all when motion is off', () => {
    setMotion('none');
    pointerDown();

    expect(host.classList.contains(RIPPLE_ACTIVE_CLASS)).toBe(false);
  });

  it('cancels the ink once the press travels far enough to be a scroll', () => {
    press({ clientX: 50, clientY: 25 });
    expect(host.classList.contains(RIPPLE_ACTIVE_CLASS)).toBe(true);

    host.dispatchEvent(
      new PointerEvent('pointermove', {
        clientX: 50,
        clientY: 25 + RIPPLE_MOVE_SLOP_PX + 1,
        bubbles: true,
      }),
    );

    expect(host.classList.contains(RIPPLE_ACTIVE_CLASS)).toBe(false);
  });

  it('holds the press suppressed through a cancelled ink, so nothing depresses mid-scroll', () => {
    pointerDown({ clientX: 50, clientY: 25 });
    host.dispatchEvent(
      new PointerEvent('pointermove', {
        clientX: 50,
        clientY: 25 + RIPPLE_MOVE_SLOP_PX + 1,
        bubbles: true,
      }),
    );

    expect(host.style.getPropertyValue(PRESS_SCALE_PROPERTY)).toBe('1');
  });

  it('keeps the ink through a tremor inside the slop threshold', () => {
    press({ clientX: 50, clientY: 25 });
    host.dispatchEvent(
      new PointerEvent('pointermove', {
        clientX: 50,
        clientY: 25 + RIPPLE_MOVE_SLOP_PX - 1,
        bubbles: true,
      }),
    );

    expect(host.classList.contains(RIPPLE_ACTIVE_CLASS)).toBe(true);
  });

  it('waits before inking a touch, so a scroll can declare itself first', () => {
    vi.useFakeTimers();
    pointerDown();
    expect(host.classList.contains(RIPPLE_ACTIVE_CLASS)).toBe(false);

    vi.advanceTimersByTime(RIPPLE_TOUCH_DELAY_MS);
    expect(host.classList.contains(RIPPLE_ACTIVE_CLASS)).toBe(true);
  });

  it('never inks a touch that turns into a scroll during the wait', () => {
    vi.useFakeTimers();
    pointerDown({ clientX: 50, clientY: 25 });
    host.dispatchEvent(
      new PointerEvent('pointermove', {
        clientX: 50,
        clientY: 25 + RIPPLE_MOVE_SLOP_PX + 1,
        bubbles: true,
      }),
    );
    vi.advanceTimersByTime(RIPPLE_TOUCH_DELAY_MS);

    expect(host.classList.contains(RIPPLE_ACTIVE_CLASS)).toBe(false);
  });

  it('never inks a touch the browser takes over during the wait', () => {
    vi.useFakeTimers();
    pointerDown();
    host.dispatchEvent(new PointerEvent('pointercancel', { bubbles: true }));
    vi.advanceTimersByTime(RIPPLE_TOUCH_DELAY_MS);

    expect(host.classList.contains(RIPPLE_ACTIVE_CLASS)).toBe(false);
  });

  it('inks a tap lifted before the wait passes, and lets it go', () => {
    vi.useFakeTimers();
    pointerDown();
    host.dispatchEvent(new PointerEvent('pointerup', { bubbles: true }));

    expect(host.classList.contains(RIPPLE_ACTIVE_CLASS)).toBe(true);
    expect(host.classList.contains(RIPPLE_RELEASED_CLASS)).toBe(true);
  });

  it('holds the ink while the contact lasts and lets it go on release', () => {
    press();
    expect(host.classList.contains(RIPPLE_RELEASED_CLASS)).toBe(false);

    host.dispatchEvent(new PointerEvent('pointerup', { bubbles: true }));
    expect(host.classList.contains(RIPPLE_RELEASED_CLASS)).toBe(true);
  });

  it('strikes fresh ink for the next press after a release', () => {
    press();
    host.dispatchEvent(new PointerEvent('pointerup', { bubbles: true }));
    press();

    expect(host.classList.contains(RIPPLE_ACTIVE_CLASS)).toBe(true);
    expect(host.classList.contains(RIPPLE_RELEASED_CLASS)).toBe(false);
  });

  it('measures an unpositioned host against the box its ink is laid over', () => {
    // A stretched link inks the row its hit area covers: a 300×60 row whose link text sits
    // 40px in, struck 100px across the row.
    const row = document.createElement('div');
    row.getBoundingClientRect = () => ({ left: 0, top: 0, width: 300, height: 60 }) as DOMRect;
    Object.defineProperty(host, 'offsetParent', { configurable: true, get: () => row });
    host.getBoundingClientRect = () => ({ left: 40, top: 20, width: 80, height: 20 }) as DOMRect;

    pointerDown({ pointerType: 'pen', clientX: 100, clientY: 30 });

    expect(host.style.getPropertyValue(RIPPLE_X_PROPERTY)).toBe('100px');
    expect(host.style.getPropertyValue(RIPPLE_Y_PROPERTY)).toBe('30px');
    expect(parseFloat(host.style.getPropertyValue(RIPPLE_DIAMETER_PROPERTY))).toBeCloseTo(Math.hypot(200, 30), 3);
  });

  it('measures a positioned host against its own box', () => {
    host.style.position = 'relative';
    Object.defineProperty(host, 'offsetParent', { configurable: true, get: () => document.body });

    pointerDown({ pointerType: 'pen', clientX: 50, clientY: 25 });

    expect(host.style.getPropertyValue(RIPPLE_X_PROPERTY)).toBe('50px');
  });

  it('releases the ink of a pen lifted after sliding off the host', () => {
    pointerDown({ pointerType: 'pen', pointerId: 3 });
    document.body.dispatchEvent(new PointerEvent('pointerup', { pointerId: 3, bubbles: true }));

    expect(host.classList.contains(RIPPLE_RELEASED_CLASS)).toBe(true);
  });

  it('keeps the ink held through the end of another pointer', () => {
    pointerDown({ pointerType: 'pen', pointerId: 3 });
    document.body.dispatchEvent(new PointerEvent('pointerup', { pointerId: 4, bubbles: true }));

    expect(host.classList.contains(RIPPLE_RELEASED_CLASS)).toBe(false);
  });

  it('inks nothing in an app that never configured motion', () => {
    document.documentElement.removeAttribute(MOTION_ATTRIBUTE);
    pointerDown();

    expect(host.classList.contains(RIPPLE_ACTIVE_CLASS)).toBe(false);
  });

  it('leaves the host\'s own `disabled` binding on the element, not on itself', async () => {
    fixture.componentInstance.disabled.set(true);
    await fixture.whenStable();

    // An input named `disabled` here would swallow this binding and leave the
    // control enabled.
    expect(host.disabled).toBe(true);
  });

  it('inks nothing while disabled', async () => {
    fixture.componentInstance.rippleDisabled.set(true);
    await fixture.whenStable();

    pointerDown();

    expect(host.classList.contains(RIPPLE_ACTIVE_CLASS)).toBe(false);
  });
});

describe('RippleDirective pointer configuration', () => {
  let fixture: ComponentFixture<RippleHost>;
  let host: HTMLButtonElement;

  const BOUNDS = { left: 0, top: 0, width: 200, height: 50 } as DOMRect;

  async function build(pointerTypes?: pointerType[]): Promise<void> {
    TestBed.resetTestingModule();
    document.documentElement.setAttribute(MOTION_ATTRIBUTE, 'full');

    await TestBed.configureTestingModule({
      imports: [RippleHost],
      providers: pointerTypes
        ? [{ provide: RIPPLE_CONFIG, useValue: { pointerTypes } }]
        : [],
    }).compileComponents();

    fixture = TestBed.createComponent(RippleHost);
    await fixture.whenStable();
    host = fixture.nativeElement.querySelector('button');
    host.getBoundingClientRect = () => BOUNDS;
  }

  function press(pointer: pointerType): void {
    host.dispatchEvent(
      new PointerEvent('pointerdown', { pointerType: pointer, clientX: 50, clientY: 25, bubbles: true }),
    );
  }

  afterEach(() => document.documentElement.removeAttribute(MOTION_ATTRIBUTE));

  it('leaves a mouse to the press by default', async () => {
    expect(DEFAULT_RIPPLE_CONFIG.pointerTypes).toEqual(['touch', 'pen']);

    await build();
    press('mouse');

    expect(host.classList.contains(RIPPLE_ACTIVE_CLASS)).toBe(false);
  });

  it('inks a mouse when the app configures it to', async () => {
    await build(['mouse', 'touch', 'pen']);
    press('mouse');

    expect(host.classList.contains(RIPPLE_ACTIVE_CLASS)).toBe(true);
  });

  it('stands the press down for whichever pointer inks', async () => {
    await build(['mouse']);
    press('mouse');

    // One contact, one effect — widening the pointers must not stack ink on press.
    expect(host.style.getPropertyValue(PRESS_SCALE_PROPERTY)).toBe('1');
  });

  it('narrows to touch alone when configured, leaving a pen to the press', async () => {
    await build(['touch']);
    press('pen');

    expect(host.classList.contains(RIPPLE_ACTIVE_CLASS)).toBe(false);
  });

  it('lets a host override the app-wide pointers', async () => {
    await build(['touch', 'pen']);
    fixture.componentInstance.pointerTypes.set(['mouse']);
    await fixture.whenStable();

    press('mouse');
    expect(host.classList.contains(RIPPLE_ACTIVE_CLASS)).toBe(true);

    host.classList.remove(RIPPLE_ACTIVE_CLASS);
    press('touch');
    expect(host.classList.contains(RIPPLE_ACTIVE_CLASS)).toBe(false);
  });

  it('still defers to reduced motion however wide the pointers are', async () => {
    await build(['mouse', 'touch', 'pen']);
    document.documentElement.setAttribute(MOTION_ATTRIBUTE, 'essential');

    press('touch');

    expect(host.classList.contains(RIPPLE_ACTIVE_CLASS)).toBe(false);
    expect(host.style.getPropertyValue(PRESS_SCALE_PROPERTY)).toBe('');
  });
});
