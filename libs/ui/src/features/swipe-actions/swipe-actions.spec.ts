import { Component, signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HAPTIC_FEEDBACK, PanEvent } from '@thalassic/core';
import { SwipeActions } from './swipe-actions';

/** A row whose end side is always offered and whose start side is optional. */
@Component({
  imports: [SwipeActions],
  template: `
    <tls-swipe-actions
      (startCommitted)="startCommitted.set(startCommitted() + 1)"
      (endCommitted)="endCommitted.set(endCommitted() + 1)"
    >
      <p>Row</p>

      @if (offersStart()) {
        <ng-template #startAction>Start</ng-template>
      }
      <ng-template #endAction>End</ng-template>
    </tls-swipe-actions>
  `,
})
class SwipeActionsHost {
  readonly offersStart = signal(true);
  readonly startCommitted = signal(0);
  readonly endCommitted = signal(0);
}

describe('SwipeActions', () => {
  let fixture: ComponentFixture<SwipeActionsHost>;
  let hapticImpact: ReturnType<typeof vi.fn>;

  /** A pan event that has travelled `deltaX`, carried at `velocityX` px/ms. */
  function panEvent(deltaX: number, velocityX: number): PanEvent {
    return {
      deltaX,
      deltaY: 0,
      distance: Math.abs(deltaX),
      velocityX,
      velocityY: 0,
      direction: deltaX < 0 ? 'left' : 'right',
      logicalDirection: deltaX < 0 ? 'left' : 'right',
      pointerType: 'touch',
    } as PanEvent;
  }

  /** The row's pan handlers, which the template binds to its pan directive. */
  function panHandlers(): Record<'onPanStart' | 'onPanMove' | 'onPanEnd', (event: PanEvent) => void> {
    return fixture.debugElement.children[0].componentInstance as unknown as Record<
      'onPanStart' | 'onPanMove' | 'onPanEnd',
      (event: PanEvent) => void
    >;
  }

  /** A release after travelling `deltaX`, carried at `velocityX` px/ms. */
  function release(deltaX: number, velocityX: number): void {
    panHandlers().onPanEnd(panEvent(deltaX, velocityX));
  }

  beforeEach(async () => {
    hapticImpact = vi.fn();
    await TestBed.configureTestingModule({
      imports: [SwipeActionsHost],
      providers: [{ provide: HAPTIC_FEEDBACK, useValue: { impact: hapticImpact } }],
    }).compileComponents();

    fixture = TestBed.createComponent(SwipeActionsHost);
    await fixture.whenStable();
  });

  it('commits a side that opened past the threshold', () => {
    release(-96, 0);

    expect(fixture.componentInstance.endCommitted()).toBe(1);
  });

  it('commits a side on a flick that never reached the threshold', () => {
    release(-20, -1);

    expect(fixture.componentInstance.endCommitted()).toBe(1);
  });

  // Travel toward a side with no action still rubber-bands, so the offset alone
  // never rules the side out — and the flick arm asks nothing of how far the row
  // opened. A side that cannot open must not be able to commit either.
  it('refuses a flick toward a side that offers no action', async () => {
    fixture.componentInstance.offersStart.set(false);
    await fixture.whenStable();

    release(200, 3);

    expect(fixture.componentInstance.startCommitted()).toBe(0);
  });

  it('still commits that side once it offers an action', async () => {
    fixture.componentInstance.offersStart.set(true);
    await fixture.whenStable();

    release(200, 3);

    expect(fixture.componentInstance.startCommitted()).toBe(1);
  });

  it('taps once as a reveal arms, and again only after it disarms', () => {
    const handlers = panHandlers();
    handlers.onPanStart(panEvent(0, 0));

    handlers.onPanMove(panEvent(-40, 0));
    expect(hapticImpact).not.toHaveBeenCalled();

    handlers.onPanMove(panEvent(-96, 0));
    handlers.onPanMove(panEvent(-110, 0));
    expect(hapticImpact).toHaveBeenCalledExactlyOnceWith('light');

    handlers.onPanMove(panEvent(-40, 0));
    handlers.onPanMove(panEvent(-96, 0));
    expect(hapticImpact).toHaveBeenCalledTimes(2);
  });
});
