import { Component } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';

import { Splitter } from './splitter';
import { SplitterPanel } from './splitter-panel';

@Component({
  imports: [Splitter, SplitterPanel],
  template: `
    <tls-splitter [orientation]="orientation">
      <tls-splitter-panel [size]="sizeOne" [min]="minOne" [collapsible]="collapsibleOne">
        One
      </tls-splitter-panel>
      <tls-splitter-panel [size]="sizeTwo">Two</tls-splitter-panel>
      <tls-splitter-panel [size]="sizeThree">Three</tls-splitter-panel>
    </tls-splitter>
  `,
})
class HostComponent {
  orientation: 'horizontal' | 'vertical' = 'horizontal';
  sizeOne: number | null = null;
  sizeTwo: number | null = null;
  sizeThree: number | null = null;
  minOne = 0;
  collapsibleOne = false;
}

describe('Splitter', () => {
  let fixture: ComponentFixture<HostComponent>;
  let host: HostComponent;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HostComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(HostComponent);
    host = fixture.componentInstance;
  });

  function panels(): SplitterPanel[] {
    return fixture.debugElement
      .queryAll(By.directive(SplitterPanel))
      .map(debugElement => debugElement.componentInstance as SplitterPanel);
  }

  function gutters(): HTMLElement[] {
    return Array.from(
      fixture.nativeElement.querySelectorAll('.tls-splitter-gutter'),
    ) as HTMLElement[];
  }

  it('renders one gutter per seam', async () => {
    await fixture.whenStable();
    expect(gutters().length).toBe(2);
  });

  it('distributes unset sizes to sum to 100%', async () => {
    await fixture.whenStable();

    const sizes = panels().map(panel => panel.size() ?? 0);
    const total = sizes.reduce((sum, size) => sum + size, 0);

    expect(Math.round(total)).toBe(100);
  });

  it('normalizes provided sizes that exceed 100%', async () => {
    host.sizeOne = 80;
    host.sizeTwo = 80;
    fixture.detectChanges();
    await fixture.whenStable();

    const total = panels()
      .map(panel => panel.size() ?? 0)
      .reduce((sum, size) => sum + size, 0);

    expect(Math.round(total)).toBe(100);
  });

  it('normalizes when every panel has an explicit size that sums past 100%', async () => {
    // Every panel is specified, so the auto-share branch cannot mask the rescale.
    host.sizeOne = 40;
    host.sizeTwo = 40;
    host.sizeThree = 40;
    fixture.detectChanges();
    await fixture.whenStable();

    const total = panels()
      .map(panel => panel.size() ?? 0)
      .reduce((sum, size) => sum + size, 0);

    expect(Math.round(total)).toBe(100);
  });

  it('keeps a resized pair sum constant and honours the min constraint', async () => {
    host.sizeOne = 40;
    host.sizeTwo = 40;
    host.minOne = 30;
    fixture.detectChanges();
    await fixture.whenStable();

    const [firstPanel, secondPanel] = panels();
    const pairSum = (firstPanel.size() ?? 0) + (secondPanel.size() ?? 0);

    const firstGutter = gutters()[0];
    firstGutter.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowLeft' }));
    fixture.detectChanges();

    expect((firstPanel.size() ?? 0) + (secondPanel.size() ?? 0)).toBeCloseTo(pairSum, 5);
    expect(firstPanel.size() ?? 0).toBeGreaterThanOrEqual(30);
  });

  it('snaps a collapsible panel shut when resized past its min', async () => {
    host.sizeOne = 40;
    host.sizeTwo = 40;
    host.minOne = 30;
    host.collapsibleOne = true;
    fixture.detectChanges();
    await fixture.whenStable();

    const [firstPanel, secondPanel] = panels();
    const pairSum = (firstPanel.size() ?? 0) + (secondPanel.size() ?? 0);

    const firstGutter = gutters()[0];
    // Drive the leading panel below `min - overshoot` so it snaps to collapsed.
    for (let press = 0; press < 6; press++) {
      firstGutter.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowLeft' }));
      fixture.detectChanges();
    }

    expect(firstPanel.collapsed()).toBe(true);
    expect(firstPanel.size() ?? 0).toBe(0);
    expect((firstPanel.size() ?? 0) + (secondPanel.size() ?? 0)).toBeCloseTo(pairSum, 5);

    // Resizing back out re-expands the panel to at least its min.
    for (let press = 0; press < 8; press++) {
      firstGutter.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowRight' }));
      fixture.detectChanges();
    }

    expect(firstPanel.collapsed()).toBe(false);
    expect(firstPanel.size() ?? 0).toBeGreaterThanOrEqual(30);
  });

  it('does not collapse a non-collapsible panel past its min', async () => {
    host.sizeOne = 40;
    host.sizeTwo = 40;
    host.minOne = 30;
    host.collapsibleOne = false;
    fixture.detectChanges();
    await fixture.whenStable();

    const [firstPanel] = panels();

    const firstGutter = gutters()[0];
    for (let press = 0; press < 6; press++) {
      firstGutter.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowLeft' }));
      fixture.detectChanges();
    }

    expect(firstPanel.collapsed()).toBe(false);
    expect(firstPanel.size() ?? 0).toBeCloseTo(30, 5);
  });

  it('collapses and restores a panel via its collapsed model', async () => {
    host.sizeOne = 40;
    host.sizeTwo = 40;
    fixture.detectChanges();
    await fixture.whenStable();

    const [firstPanel, secondPanel] = panels();
    const originalSecond = secondPanel.size() ?? 0;

    firstPanel.collapsed.set(true);
    fixture.detectChanges();
    await fixture.whenStable();

    expect(firstPanel.size() ?? 0).toBe(0);
    expect(secondPanel.size() ?? 0).toBeCloseTo(originalSecond + 40, 5);

    firstPanel.collapsed.set(false);
    fixture.detectChanges();
    await fixture.whenStable();

    expect(firstPanel.size() ?? 0).toBeCloseTo(40, 5);
    expect(secondPanel.size() ?? 0).toBeCloseTo(originalSecond, 5);
  });
});
