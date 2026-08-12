import { Component, signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TooltipDelegateDirective } from './tooltip-delegate.directive';

@Component({
  imports: [TooltipDelegateDirective],
  template: `
    <div tlsTooltipDelegate [tooltipDisabled]="disabled()">
      @for (item of items(); track item) {
        <button type="button" [attr.data-tooltip]="item">{{ item }}</button>
      }
      <button type="button" class="bare">no tooltip</button>
      <div data-tooltip="composite" class="composite">
        <button type="button" class="composite__first">one</button>
        <button type="button" class="composite__second">two</button>
      </div>
      <button type="button" class="labelled" aria-label="third" data-tooltip="third">third</button>
      <button type="button" class="described" aria-describedby="help" data-tooltip="fourth">
        fourth
      </button>
    </div>
  `,
})
class TooltipDelegateHost {
  public readonly items = signal(['first', 'second']);
  public readonly disabled = signal(false);
}

describe('TooltipDelegateDirective', () => {
  let fixture: ComponentFixture<TooltipDelegateHost>;

  const queryButtons = () =>
    (fixture.nativeElement as HTMLElement).querySelectorAll<HTMLElement>('button');
  const queryElement = (selector: string) => {
    const element = (fixture.nativeElement as HTMLElement).querySelector<HTMLElement>(selector);
    if (!element) throw new Error(`No element matches "${selector}"`);
    return element;
  };
  const queryTooltip = () => document.querySelector('tls-tooltip');

  const hover = (element: HTMLElement) =>
    element.dispatchEvent(new PointerEvent('pointerover', { bubbles: true, pointerType: 'mouse' }));
  const unhover = (element: HTMLElement, relatedTarget: EventTarget | null = null) =>
    element.dispatchEvent(
      new PointerEvent('pointerout', { bubbles: true, pointerType: 'mouse', relatedTarget }),
    );

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TooltipDelegateHost],
    }).compileComponents();

    fixture = TestBed.createComponent(TooltipDelegateHost);
    await fixture.whenStable();
  });

  afterEach(() => {
    fixture.destroy();
  });

  it("shows the hovered item's content from a single directive", async () => {
    hover(queryButtons()[0]);
    await fixture.whenStable();

    expect(queryTooltip()?.textContent?.trim()).toBe('first');
  });

  it('links the item to the tooltip with aria-describedby while visible', async () => {
    const item = queryButtons()[0];
    hover(item);
    await fixture.whenStable();

    expect(item.getAttribute('aria-describedby')).toBe(queryTooltip()?.id);

    unhover(item);
    await fixture.whenStable();

    expect(item.hasAttribute('aria-describedby')).toBe(false);
  });

  it('re-anchors to the next item hovered', async () => {
    const [first, second] = Array.from(queryButtons());
    hover(first);
    await fixture.whenStable();
    unhover(first, second);
    hover(second);
    await fixture.whenStable();

    expect(queryTooltip()?.textContent?.trim()).toBe('second');
    expect(first.hasAttribute('aria-describedby')).toBe(false);
  });

  it('ignores descendants without the content attribute', async () => {
    hover(queryElement('.bare'));
    await fixture.whenStable();

    expect(queryTooltip()).toBeNull();
  });

  it('keeps the tooltip while focus moves between children of the same item', async () => {
    const first = queryElement('.composite__first');
    first.dispatchEvent(new FocusEvent('focusin', { bubbles: true }));
    await fixture.whenStable();

    expect(queryTooltip()?.textContent?.trim()).toBe('composite');

    first.dispatchEvent(
      new FocusEvent('focusout', {
        bubbles: true,
        relatedTarget: queryElement('.composite__second'),
      }),
    );
    await fixture.whenStable();

    expect(queryTooltip()?.textContent?.trim()).toBe('composite');
  });

  it("joins the item's own description instead of replacing it", async () => {
    const item = queryElement('.described');
    hover(item);
    await fixture.whenStable();

    expect(item.getAttribute('aria-describedby')).toBe(`help ${queryTooltip()?.id}`);

    unhover(item);
    await fixture.whenStable();

    expect(item.getAttribute('aria-describedby')).toBe('help');
  });

  it('omits aria-describedby when the tooltip repeats the accessible name', async () => {
    const item = queryElement('.labelled');
    hover(item);
    await fixture.whenStable();

    expect(queryTooltip()?.textContent?.trim()).toBe('third');
    expect(item.hasAttribute('aria-describedby')).toBe(false);
  });

  it('shows on keyboard focus', async () => {
    queryButtons()[1].dispatchEvent(new FocusEvent('focusin', { bubbles: true }));
    await fixture.whenStable();

    expect(queryTooltip()?.textContent?.trim()).toBe('second');
  });

  it('keeps a focused item described while a pointer visits another item', async () => {
    const [first, second] = Array.from(queryButtons());
    first.dispatchEvent(new FocusEvent('focusin', { bubbles: true }));
    await fixture.whenStable();

    hover(second);
    await fixture.whenStable();

    expect(queryTooltip()?.textContent?.trim()).toBe('second');

    unhover(second);
    await fixture.whenStable();

    // Focus never left the first item, so its tooltip is what remains.
    expect(queryTooltip()?.textContent?.trim()).toBe('first');
    expect(second.hasAttribute('aria-describedby')).toBe(false);
  });

  it('dismisses a tapped tooltip on the next tap outside any item', async () => {
    const item = queryButtons()[0];
    item.dispatchEvent(new PointerEvent('pointerover', { bubbles: true, pointerType: 'touch' }));
    item.dispatchEvent(new PointerEvent('pointerdown', { bubbles: true, pointerType: 'touch' }));
    await fixture.whenStable();

    expect(queryTooltip()?.textContent?.trim()).toBe('first');

    document.dispatchEvent(new PointerEvent('pointerdown', { bubbles: true, pointerType: 'touch' }));
    await fixture.whenStable();

    expect(queryTooltip()).toBeNull();
  });

  it('dismisses on Escape', async () => {
    hover(queryButtons()[0]);
    await fixture.whenStable();

    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));
    await fixture.whenStable();

    expect(queryTooltip()).toBeNull();
  });

  it('shows nothing while disabled', async () => {
    fixture.componentInstance.disabled.set(true);
    await fixture.whenStable();

    hover(queryButtons()[0]);
    await fixture.whenStable();

    expect(queryTooltip()).toBeNull();
  });
});
