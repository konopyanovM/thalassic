import { Directionality } from '@angular/cdk/bidi';
import { Component, signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { of } from 'rxjs';

import { ImageCompare } from './image-compare';
import { imageCompareOrientation } from './image-compare.types';

@Component({
  imports: [ImageCompare],
  template: `
    <tls-image-compare
      [orientation]="orientation()"
      [keyboardStep]="keyboardStep()"
      [position]="position()"
      (positionChange)="position.set($event)"
    >
      <img before src="before.png" alt="before" />
      <img after src="after.png" alt="after" />
    </tls-image-compare>
  `,
})
class HostComponent {
  readonly orientation = signal<imageCompareOrientation>('horizontal');
  readonly keyboardStep = signal(5);
  readonly position = signal(50);
}

describe('ImageCompare', () => {
  let fixture: ComponentFixture<HostComponent>;
  let host: HostComponent;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HostComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(HostComponent);
    host = fixture.componentInstance;
    fixture.detectChanges();
    await fixture.whenStable();
  });

  function handle(): HTMLElement {
    return fixture.nativeElement.querySelector('.tls-image-compare__handle') as HTMLElement;
  }

  function beforeLayer(): HTMLElement {
    return fixture.nativeElement.querySelector('.tls-image-compare__before') as HTMLElement;
  }

  async function pressKey(key: string): Promise<void> {
    handle().dispatchEvent(new KeyboardEvent('keydown', { key }));
    fixture.detectChanges();
    await fixture.whenStable();
  }

  async function setPosition(value: number): Promise<void> {
    host.position.set(value);
    fixture.detectChanges();
    await fixture.whenStable();
  }

  it('renders a slider handle with the position reflected as aria-valuenow', () => {
    const element = handle();

    expect(element.getAttribute('role')).toBe('slider');
    expect(element.getAttribute('aria-orientation')).toBe('horizontal');
    expect(element.getAttribute('aria-valuemin')).toBe('0');
    expect(element.getAttribute('aria-valuemax')).toBe('100');
    expect(element.getAttribute('aria-valuenow')).toBe('50');
  });

  it('projects the before and after images into their layers', () => {
    const projectedBefore = beforeLayer().querySelector('img');
    const projectedAfter = fixture.nativeElement.querySelector('.tls-image-compare__after img');

    expect(projectedBefore?.getAttribute('src')).toBe('before.png');
    expect(projectedAfter?.getAttribute('src')).toBe('after.png');
  });

  it('moves the divider with the horizontal arrow keys', async () => {
    await pressKey('ArrowRight');
    expect(host.position()).toBe(55);

    await pressKey('ArrowLeft');
    expect(host.position()).toBe(50);
  });

  it('ignores the vertical arrow keys while horizontal', async () => {
    await pressKey('ArrowUp');
    await pressKey('ArrowDown');

    expect(host.position()).toBe(50);
  });

  it('moves the divider with the vertical arrow keys while vertical', async () => {
    host.orientation.set('vertical');
    fixture.detectChanges();
    await fixture.whenStable();

    await pressKey('ArrowDown');
    expect(host.position()).toBe(55);

    await pressKey('ArrowUp');
    expect(host.position()).toBe(50);

    // Left/Right do nothing on a vertical divider.
    await pressKey('ArrowLeft');
    expect(host.position()).toBe(50);
  });

  it('jumps to the edges with Home and End', async () => {
    await pressKey('End');
    expect(host.position()).toBe(100);

    await pressKey('Home');
    expect(host.position()).toBe(0);
  });

  it('clamps the position within 0–100', async () => {
    await setPosition(2);
    await pressKey('ArrowLeft');
    expect(host.position()).toBe(0);

    await setPosition(98);
    await pressKey('ArrowRight');
    expect(host.position()).toBe(100);
  });

  it('clips the before layer from the layout-start edge to the divider', async () => {
    await setPosition(30);
    expect(beforeLayer().style.clipPath).toBe('inset(0 70% 0 0)');

    host.orientation.set('vertical');
    fixture.detectChanges();
    await fixture.whenStable();

    expect(beforeLayer().style.clipPath).toBe('inset(0 0 70% 0)');
  });
});

describe('ImageCompare (RTL)', () => {
  let fixture: ComponentFixture<HostComponent>;
  let host: HostComponent;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HostComponent],
      providers: [{ provide: Directionality, useValue: { value: 'rtl', change: of() } }],
    }).compileComponents();

    fixture = TestBed.createComponent(HostComponent);
    host = fixture.componentInstance;
    fixture.detectChanges();
    await fixture.whenStable();
  });

  async function pressKey(key: string): Promise<void> {
    const handle = fixture.nativeElement.querySelector('.tls-image-compare__handle') as HTMLElement;
    handle.dispatchEvent(new KeyboardEvent('keydown', { key }));
    fixture.detectChanges();
    await fixture.whenStable();
  }

  it('mirrors the horizontal arrow keys', async () => {
    await pressKey('ArrowLeft');
    expect(host.position()).toBe(55);

    await pressKey('ArrowRight');
    expect(host.position()).toBe(50);
  });

  it('clips the before layer from the physical-end edge', async () => {
    host.position.set(30);
    fixture.detectChanges();
    await fixture.whenStable();

    const beforeLayer = fixture.nativeElement.querySelector(
      '.tls-image-compare__before',
    ) as HTMLElement;

    expect(beforeLayer.style.clipPath).toBe('inset(0 0 0 70%)');
  });
});
