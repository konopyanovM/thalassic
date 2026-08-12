import { Component, signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Button } from '../button';
import { TooltipDirective } from './tooltip.directive';

@Component({
  imports: [Button, TooltipDirective],
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
    <button type="button" class="dynamic" [tlsTooltip]="label()" [tooltipDisabled]="disabled()">
      dynamic
    </button>
    <span class="static" tlsTooltip="Static">static</span>
    <button type="button" class="untooltipped">plain button</button>
    <tls-button class="component" tlsTooltip="Component">component</tls-button>
    <div class="wrapper" tabindex="-1" tlsTooltip="Wrapped">
      <button type="button" class="wrapper__first">first</button>
      <button type="button" class="wrapper__second">second</button>
    </div>
  `,
})
class TooltipHost {
  public readonly label = signal('Before');
  public readonly disabled = signal(false);
}

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
  // A touch contact enters the element before it goes down, per the pointer-events spec.
  const tap = (element: HTMLElement) => {
    element.dispatchEvent(new PointerEvent('pointerenter', { bubbles: true, pointerType: 'touch' }));
    element.dispatchEvent(new PointerEvent('pointerdown', { bubbles: true, pointerType: 'touch' }));
  };
  // Focus reaches a host through the bubbling pair; the browser fires both on the focused element.
  const focus = (element: HTMLElement) => {
    element.dispatchEvent(new FocusEvent('focus'));
    element.dispatchEvent(new FocusEvent('focusin', { bubbles: true }));
  };
  const blur = (element: HTMLElement, relatedTarget: EventTarget | null = null) => {
    element.dispatchEvent(new FocusEvent('blur'));
    element.dispatchEvent(new FocusEvent('focusout', { bubbles: true, relatedTarget }));
  };

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

  it('keeps a focused tooltip while a pointer passes over and leaves', async () => {
    const host = queryElement('.plain');
    focus(host);
    await fixture.whenStable();

    hover(host);
    await fixture.whenStable();
    unhover(host);
    await fixture.whenStable();

    expect(queryTooltip()?.textContent?.trim()).toBe('Plain');

    blur(host);
    await fixture.whenStable();

    expect(queryTooltip()).toBeNull();
  });

  it('shows one tooltip at a time across triggers', async () => {
    focus(queryElement('.plain'));
    await fixture.whenStable();
    hover(queryElement('.described'));
    await fixture.whenStable();

    expect(document.querySelectorAll('tls-tooltip').length).toBe(1);
    expect(queryElement('.plain').hasAttribute('aria-describedby')).toBe(false);
  });

  it('shows for focus landing on a control inside the host', async () => {
    const control = queryElement('.wrapper__first');
    focus(control);
    await fixture.whenStable();

    expect(queryTooltip()?.textContent?.trim()).toBe('Wrapped');
    // The description belongs on the element focus is actually on, not on the wrapper around it.
    expect(control.getAttribute('aria-describedby')).toBe(queryTooltip()?.id);
  });

  it("shows on focus for a component host whose control is in its own template", async () => {
    const control = queryElement('.component button');
    control.focus();
    focus(control);
    await fixture.whenStable();

    expect(queryTooltip()?.textContent?.trim()).toBe('Component');
    expect(control.getAttribute('aria-describedby')).toBe(queryTooltip()?.id);
  });

  it('keeps the tooltip while focus moves between controls inside the host', async () => {
    const first = queryElement('.wrapper__first');
    const second = queryElement('.wrapper__second');
    focus(first);
    await fixture.whenStable();

    blur(first, second);
    focus(second);
    await fixture.whenStable();

    expect(queryTooltip()?.textContent?.trim()).toBe('Wrapped');

    blur(second, queryElement('.untooltipped'));
    await fixture.whenStable();

    expect(queryTooltip()).toBeNull();
    expect(second.hasAttribute('aria-describedby')).toBe(false);
  });

  it('dismisses a tapped tooltip on the next tap outside it', async () => {
    const host = queryElement('.static');
    tap(host);
    await fixture.whenStable();

    expect(queryTooltip()?.textContent?.trim()).toBe('Static');

    tap(queryElement('.untooltipped'));
    await fixture.whenStable();

    expect(queryTooltip()).toBeNull();
  });

  it('survives the tap that opened it and toggles off on a second one', async () => {
    const host = queryElement('.static');
    tap(host);
    await fixture.whenStable();

    expect(queryTooltip()).not.toBeNull();

    tap(host);
    await fixture.whenStable();

    expect(queryTooltip()).toBeNull();
  });

  it('hides a visible tooltip when the trigger is disabled', async () => {
    hover(queryElement('.dynamic'));
    await fixture.whenStable();

    expect(queryTooltip()).not.toBeNull();

    fixture.componentInstance.disabled.set(true);
    await fixture.whenStable();

    expect(queryTooltip()).toBeNull();
  });

  it('follows content that changes while the tooltip is visible', async () => {
    const host = queryElement('.dynamic');
    hover(host);
    await fixture.whenStable();

    expect(queryTooltip()?.textContent?.trim()).toBe('Before');

    fixture.componentInstance.label.set('After');
    await fixture.whenStable();

    expect(queryTooltip()?.textContent?.trim()).toBe('After');
    expect(host.getAttribute('aria-describedby')).toBe(queryTooltip()?.id);
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
