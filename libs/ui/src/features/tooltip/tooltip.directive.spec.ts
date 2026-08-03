import { Component } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TooltipDirective } from './tooltip.directive';

@Component({
  imports: [TooltipDirective],
  template: `
    <button type="button" class="plain" tlsTooltip="Plain">plain</button>
    <button type="button" class="described" aria-describedby="help" tlsTooltip="Described">
      described
    </button>
    <button type="button" class="labelled" aria-label="Labelled" tlsTooltip="Labelled">
      labelled
    </button>
    <button type="button" class="arrowless" tlsTooltip="Arrowless" [tooltipArrow]="false">
      arrowless
    </button>
  `,
})
class TooltipHost {}

describe('TooltipDirective', () => {
  let fixture: ComponentFixture<TooltipHost>;

  const queryElement = (selector: string) => {
    const element = (fixture.nativeElement as HTMLElement).querySelector<HTMLElement>(selector);
    if (!element) throw new Error(`No element matches "${selector}"`);
    return element;
  };
  const queryTooltip = () => document.querySelector('tls-tooltip');

  const hover = (element: HTMLElement) =>
    element.dispatchEvent(
      new PointerEvent('pointerenter', { bubbles: true, pointerType: 'mouse' }),
    );
  const unhover = (element: HTMLElement) =>
    element.dispatchEvent(
      new PointerEvent('pointerleave', { bubbles: true, pointerType: 'mouse' }),
    );

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TooltipHost],
    }).compileComponents();

    fixture = TestBed.createComponent(TooltipHost);
    await fixture.whenStable();
  });

  afterEach(() => {
    fixture.destroy();
  });

  it('describes the host while visible', async () => {
    const host = queryElement('.plain');
    hover(host);
    await fixture.whenStable();

    expect(queryTooltip()?.textContent?.trim()).toBe('Plain');
    expect(host.getAttribute('aria-describedby')).toBe(queryTooltip()?.id);

    unhover(host);
    await fixture.whenStable();

    expect(host.hasAttribute('aria-describedby')).toBe(false);
  });

  it('omits aria-describedby when the tooltip repeats the accessible name', async () => {
    const host = queryElement('.labelled');
    hover(host);
    await fixture.whenStable();

    expect(queryTooltip()?.textContent?.trim()).toBe('Labelled');
    expect(host.hasAttribute('aria-describedby')).toBe(false);
  });

  it('points an arrow at the edge the tooltip settled on', async () => {
    hover(queryElement('.plain'));
    await fixture.whenStable();

    const tooltip = queryTooltip();
    expect(tooltip?.classList.contains('tls-tooltip--arrow')).toBe(true);
    expect(tooltip?.classList.contains('tls-tooltip--arrow-bottom')).toBe(true);
    expect(tooltip?.classList.contains('tls-tooltip--arrow-align-center')).toBe(true);
  });

  it('omits the arrow when it is turned off', async () => {
    hover(queryElement('.arrowless'));
    await fixture.whenStable();

    expect(queryTooltip()?.className).not.toContain('tls-tooltip--arrow');
  });

  it('dismisses on Escape', async () => {
    hover(queryElement('.plain'));
    await fixture.whenStable();

    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));
    await fixture.whenStable();

    expect(queryTooltip()).toBeNull();
  });

  it("joins the host's own description instead of replacing it", async () => {
    const host = queryElement('.described');
    hover(host);
    await fixture.whenStable();

    expect(host.getAttribute('aria-describedby')).toBe(`help ${queryTooltip()?.id}`);

    unhover(host);
    await fixture.whenStable();

    expect(host.getAttribute('aria-describedby')).toBe('help');
  });
});
