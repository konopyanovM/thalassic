import { Component, signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { PanEvent } from '@thalassic/core';
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

  /** A release after travelling `deltaX`, carried at `velocityX` px/ms. */
  function release(deltaX: number, velocityX: number): void {
    const swipe = fixture.debugElement.children[0].componentInstance as SwipeActions;
    const event = {
      deltaX,
      deltaY: 0,
      distance: Math.abs(deltaX),
      velocityX,
      velocityY: 0,
      direction: deltaX < 0 ? 'left' : 'right',
      logicalDirection: deltaX < 0 ? 'left' : 'right',
      pointerType: 'touch',
    } as PanEvent;

    (swipe as unknown as { onPanEnd: (event: PanEvent) => void }).onPanEnd(event);
  }

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SwipeActionsHost],
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
});
