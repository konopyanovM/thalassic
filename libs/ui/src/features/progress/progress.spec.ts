import { Component, signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Progress } from './progress';
import { progressActiveSegment } from './progress.types';

@Component({
  imports: [Progress],
  template: `
    <tls-progress
      [value]="value()"
      [max]="max()"
      [segments]="segments()"
      [activeSegment]="activeSegment()"
      ariaLabel="Completion"
    />
  `,
})
class HostComponent {
  readonly value = signal(40);
  readonly max = signal(100);
  readonly segments = signal<number | null>(null);
  readonly activeSegment = signal<progressActiveSegment>(null);
}

describe('Progress', () => {
  let fixture: ComponentFixture<HostComponent>;
  let component: HostComponent;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HostComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(HostComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
    await fixture.whenStable();
  });

  const host = (): HTMLElement => fixture.nativeElement.querySelector('tls-progress');
  const fills = (): HTMLElement[] => Array.from(host().querySelectorAll('.tls-progress-fill'));

  it('exposes the progressbar ARIA contract', () => {
    expect(host().getAttribute('role')).toBe('progressbar');
    expect(host().getAttribute('aria-valuemin')).toBe('0');
    expect(host().getAttribute('aria-valuemax')).toBe('100');
    expect(host().getAttribute('aria-valuenow')).toBe('40');
    expect(host().getAttribute('aria-label')).toBe('Completion');
  });

  it('renders one continuous segment filled to the value share', () => {
    expect(fills().length).toBe(1);
    expect(fills()[0].style.inlineSize).toBe('40%');
  });

  it('clamps the value into [0, max] for ARIA and the fill', () => {
    component.value.set(250);
    fixture.detectChanges();

    expect(host().getAttribute('aria-valuenow')).toBe('100');
    expect(fills()[0].style.inlineSize).toBe('100%');

    component.value.set(-10);
    fixture.detectChanges();

    expect(host().getAttribute('aria-valuenow')).toBe('0');
    expect(fills()[0].style.inlineSize).toBe('0%');
  });

  it('splits the track into segments filled in order', () => {
    component.max.set(6);
    component.value.set(2);
    component.segments.set(6);
    fixture.detectChanges();

    expect(fills().length).toBe(6);
    expect(fills().map(fill => fill.style.inlineSize)).toEqual([
      '100%',
      '100%',
      '0%',
      '0%',
      '0%',
      '0%',
    ]);
  });

  it('fills the boundary segment partially', () => {
    component.max.set(100);
    component.value.set(50);
    component.segments.set(4);
    fixture.detectChanges();

    expect(fills().map(fill => fill.style.inlineSize)).toEqual(['100%', '100%', '0%', '0%']);

    component.value.set(62.5);
    fixture.detectChanges();

    expect(fills().map(fill => fill.style.inlineSize)).toEqual(['100%', '100%', '50%', '0%']);
  });

  it('widens the emphasized segment via flex-grow', () => {
    const segments = (): HTMLElement[] =>
      Array.from(host().querySelectorAll('.tls-progress-segment'));

    component.max.set(6);
    component.value.set(2);
    component.segments.set(6);
    component.activeSegment.set('latest');
    fixture.detectChanges();

    expect(segments().map(segment => segment.style.flexGrow)).toEqual(['', '2', '', '', '', '']);

    component.activeSegment.set(4);
    fixture.detectChanges();

    expect(segments().map(segment => segment.style.flexGrow)).toEqual(['', '', '', '', '2', '']);

    component.value.set(0);
    component.activeSegment.set('latest');
    fixture.detectChanges();

    expect(segments()[0].style.flexGrow).toBe('2');
  });
});
