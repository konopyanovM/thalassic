import { Component, signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Accordion } from '../accordion';
import { accordionHeadingLevel } from '../accordion.types';
import { AccordionItem } from './accordion-item';

@Component({
  imports: [Accordion, AccordionItem],
  template: `
    <tls-accordion [headingLevel]="headingLevel()">
      <tls-accordion-item
        label="Shipping"
        description="Rates and delivery times"
        [(expanded)]="expanded"
      >
        <ng-template #accordionItemTrailing><span class="badge">3</span></ng-template>
        <p class="panel-content">Ships in two days.</p>
      </tls-accordion-item>
      <tls-accordion-item label="Returns" [headingLevel]="itemHeadingLevel()" disabled>
        Returns content
      </tls-accordion-item>
      <tls-accordion-item label="Wholesale">
        <ng-template #accordionItemHeader>🏭</ng-template>
        Wholesale content
      </tls-accordion-item>
    </tls-accordion>
  `,
})
class AccordionItemTestHostComponent {
  readonly headingLevel = signal<accordionHeadingLevel>(3);
  readonly itemHeadingLevel = signal<accordionHeadingLevel | undefined>(undefined);
  readonly expanded = signal(false);
}

describe('AccordionItem', () => {
  let fixture: ComponentFixture<AccordionItemTestHostComponent>;

  const items = (): HTMLElement[] =>
    Array.from(fixture.nativeElement.querySelectorAll('.tls-accordion__item'));
  const trigger = (index: number): HTMLButtonElement =>
    items()[index].querySelector('.tls-accordion__trigger') as HTMLButtonElement;
  const panel = (index: number): HTMLElement =>
    items()[index].querySelector('.tls-accordion__panel') as HTMLElement;
  const heading = (index: number): HTMLElement =>
    items()[index].querySelector('.tls-accordion__heading') as HTMLElement;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AccordionItemTestHostComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(AccordionItemTestHostComponent);
    await fixture.whenStable();
  });

  it('should render the label and description', () => {
    expect(trigger(0).textContent).toContain('Shipping');
    expect(trigger(0).textContent).toContain('Rates and delivery times');
  });

  it('should render the trailing slot', () => {
    expect(trigger(0).querySelector('.badge')).toBeTruthy();
  });

  it('should fall back to the label as the accessible name when a header template replaces it', () => {
    expect(trigger(0).getAttribute('aria-label')).toBeNull();
    expect(trigger(2).getAttribute('aria-label')).toBe('Wholesale');
  });

  it('should take the heading level from the accordion and allow a per-item override', async () => {
    expect(heading(0).getAttribute('role')).toBe('heading');
    expect(heading(0).getAttribute('aria-level')).toBe('3');

    fixture.componentInstance.headingLevel.set(2);
    fixture.componentInstance.itemHeadingLevel.set(5);
    await fixture.whenStable();

    expect(heading(0).getAttribute('aria-level')).toBe('2');
    expect(heading(1).getAttribute('aria-level')).toBe('5');
  });

  it('should wire the trigger and panel together for assistive technology', async () => {
    fixture.componentInstance.expanded.set(true);
    await fixture.whenStable();

    expect(trigger(0).getAttribute('aria-expanded')).toBe('true');
    expect(trigger(0).getAttribute('aria-controls')).toBe(panel(0).id);
    expect(panel(0).getAttribute('role')).toBe('region');
    expect(panel(0).getAttribute('aria-labelledby')).toBe(trigger(0).id);
  });

  it('should mark a collapsed panel inert', async () => {
    expect(panel(0).hasAttribute('inert')).toBe(true);

    fixture.componentInstance.expanded.set(true);
    await fixture.whenStable();

    expect(panel(0).hasAttribute('inert')).toBe(false);
  });

  it('should write a click back through the two-way expanded binding', async () => {
    trigger(0).click();
    await fixture.whenStable();

    expect(fixture.componentInstance.expanded()).toBe(true);
  });

  it('should not expand a disabled item', async () => {
    expect(trigger(1).getAttribute('aria-disabled')).toBe('true');

    trigger(1).click();
    await fixture.whenStable();

    expect(trigger(1).getAttribute('aria-expanded')).toBe('false');
  });

  it('should defer the panel content until the item is first expanded', async () => {
    expect(panel(0).querySelector('.panel-content')).toBeNull();

    fixture.componentInstance.expanded.set(true);
    await fixture.whenStable();

    expect(panel(0).querySelector('.panel-content')).toBeTruthy();
  });

  it('should keep the content rendered after collapsing so the panel can animate out', async () => {
    fixture.componentInstance.expanded.set(true);
    await fixture.whenStable();

    fixture.componentInstance.expanded.set(false);
    await fixture.whenStable();

    expect(panel(0).querySelector('.panel-content')).toBeTruthy();
  });

  it('should reflect the expanded and disabled state onto the item', async () => {
    expect(items()[0].classList).not.toContain('tls-accordion__item--expanded');

    fixture.componentInstance.expanded.set(true);
    await fixture.whenStable();

    expect(items()[0].classList).toContain('tls-accordion__item--expanded');
    expect(items()[1].classList).toContain('tls-accordion__item--disabled');
  });
});
