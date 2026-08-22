import { Component, signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AccordionItem } from './accordion-item/accordion-item';
import { Accordion } from './accordion';
import { accordionVariant } from './accordion.types';

@Component({
  imports: [Accordion, AccordionItem],
  template: `
    <tls-accordion
      [variant]="variant()"
      [multiExpandable]="multiExpandable()"
      [ariaLabel]="ariaLabel()"
      [disabled]="disabled()"
    >
      <tls-accordion-item label="First" [(expanded)]="firstExpanded">Content 1</tls-accordion-item>
      <tls-accordion-item label="Second">Content 2</tls-accordion-item>
      <tls-accordion-item label="Third" disabled>Content 3</tls-accordion-item>
    </tls-accordion>
  `,
})
class AccordionTestHostComponent {
  readonly variant = signal<accordionVariant>('flat');
  readonly multiExpandable = signal(false);
  readonly ariaLabel = signal<string | undefined>(undefined);
  readonly disabled = signal(false);
  readonly firstExpanded = signal(false);
}

describe('Accordion', () => {
  let fixture: ComponentFixture<AccordionTestHostComponent>;
  let host: HTMLElement;

  const triggers = (): HTMLButtonElement[] =>
    Array.from(fixture.nativeElement.querySelectorAll('.tls-accordion__trigger'));

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AccordionTestHostComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(AccordionTestHostComponent);
    await fixture.whenStable();
    host = fixture.nativeElement.querySelector('tls-accordion') as HTMLElement;
  });

  it('should create', () => {
    expect(host).toBeTruthy();
    expect(triggers().length).toBe(3);
  });

  it('should default to the flat variant and reflect a variant change onto the host', async () => {
    expect(host.classList).toContain('tls-accordion');
    expect(host.classList).toContain('tls-accordion--flat');

    fixture.componentInstance.variant.set('separated');
    await fixture.whenStable();

    expect(host.classList).toContain('tls-accordion--separated');
    expect(host.classList).not.toContain('tls-accordion--flat');
  });

  it('should collapse the previously expanded item when single-expandable', async () => {
    triggers()[0].click();
    await fixture.whenStable();

    expect(triggers()[0].getAttribute('aria-expanded')).toBe('true');

    triggers()[1].click();
    await fixture.whenStable();

    expect(triggers()[0].getAttribute('aria-expanded')).toBe('false');
    expect(triggers()[1].getAttribute('aria-expanded')).toBe('true');
  });

  it('should keep several items expanded when multi-expandable', async () => {
    fixture.componentInstance.multiExpandable.set(true);
    await fixture.whenStable();

    triggers()[0].click();
    triggers()[1].click();
    await fixture.whenStable();

    expect(triggers()[0].getAttribute('aria-expanded')).toBe('true');
    expect(triggers()[1].getAttribute('aria-expanded')).toBe('true');
  });

  it('should expose expandAll and collapseAll', async () => {
    fixture.componentInstance.multiExpandable.set(true);
    await fixture.whenStable();

    const accordion = fixture.debugElement.children[0].componentInstance as Accordion;

    accordion.expandAll();
    await fixture.whenStable();

    expect(triggers()[0].getAttribute('aria-expanded')).toBe('true');
    expect(triggers()[1].getAttribute('aria-expanded')).toBe('true');

    accordion.collapseAll();
    await fixture.whenStable();

    expect(triggers()[0].getAttribute('aria-expanded')).toBe('false');
    expect(triggers()[1].getAttribute('aria-expanded')).toBe('false');
  });

  it('should name the group only once an accessible name is supplied', async () => {
    expect(host.getAttribute('role')).toBeNull();
    expect(host.getAttribute('aria-label')).toBeNull();

    fixture.componentInstance.ariaLabel.set('Frequently asked questions');
    await fixture.whenStable();

    expect(host.getAttribute('role')).toBe('group');
    expect(host.getAttribute('aria-label')).toBe('Frequently asked questions');
  });

  it('should mark every item disabled when the whole accordion is', async () => {
    const items = (): HTMLElement[] =>
      Array.from(fixture.nativeElement.querySelectorAll('.tls-accordion__item'));

    expect(items()[0].classList).not.toContain('tls-accordion__item--disabled');

    fixture.componentInstance.disabled.set(true);
    await fixture.whenStable();

    for (const item of items()) {
      expect(item.classList).toContain('tls-accordion__item--disabled');
    }

    expect(triggers()[0].getAttribute('aria-disabled')).toBe('true');
  });

  it('should move focus to the next trigger on ArrowDown', async () => {
    triggers()[0].focus();
    triggers()[0].dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowDown', bubbles: true }));
    await fixture.whenStable();

    expect(document.activeElement).toBe(triggers()[1]);
  });
});
