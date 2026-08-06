import { Component, signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Rating } from './rating';

@Component({
  imports: [Rating],
  template: `
    <tls-rating
      [value]="value()"
      (valueChange)="value.set($event)"
      [max]="max()"
      [allowHalf]="allowHalf()"
      [allowClear]="allowClear()"
      [preview]="preview()"
      [readonly]="readonly()"
      [disabled]="disabled()"
      ariaLabel="Score"
    />
  `,
})
class HostComponent {
  readonly value = signal(3);
  readonly max = signal(5);
  readonly allowHalf = signal(false);
  readonly allowClear = signal(true);
  readonly preview = signal(false);
  readonly readonly = signal(false);
  readonly disabled = signal(false);
}

@Component({
  imports: [Rating],
  template: `
    <tls-rating [value]="2.5" allowHalf preview>
      <ng-template #starTemplate let-star let-filled="filled" let-preview="preview" let-half="half">
        <span class="custom-star">
          {{ filled ? 'F' : 'E' }}{{ star }}{{ preview ? 'P' : '' }}{{ half ? 'H' : '' }}
        </span>
      </ng-template>
    </tls-rating>
  `,
})
class TemplateHostComponent {}

describe('Rating', () => {
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

  function host(): HTMLElement {
    return fixture.nativeElement.querySelector('tls-rating') as HTMLElement;
  }

  function inputs(): HTMLInputElement[] {
    return Array.from(fixture.nativeElement.querySelectorAll('input[type="radio"]'));
  }

  function inputFor(option: number): HTMLInputElement {
    const element = inputs().find(input => Number(input.value) === option);
    if (!element) throw new Error(`No radio for option ${option}`);
    return element;
  }

  function fills(): HTMLElement[] {
    return Array.from(
      fixture.nativeElement.querySelectorAll('.tls-rating-fill:not(.tls-rating-fill--ghost)'),
    );
  }

  function ghostFills(): HTMLElement[] {
    return Array.from(fixture.nativeElement.querySelectorAll('.tls-rating-fill--ghost'));
  }

  async function settle(): Promise<void> {
    fixture.detectChanges();
    await fixture.whenStable();
  }

  async function activate(option: number): Promise<void> {
    const element = inputFor(option);
    const wasChecked = element.checked;
    element.checked = true;
    if (!wasChecked) element.dispatchEvent(new Event('change'));
    element.dispatchEvent(new Event('click'));
    await settle();
  }

  it('renders one radio per star carrying an accessible name, inside a labelled radiogroup', () => {
    expect(host().getAttribute('role')).toBe('radiogroup');
    expect(host().getAttribute('aria-label')).toBe('Score');

    const elements = inputs();
    expect(elements.length).toBe(5);
    expect(elements[0].getAttribute('aria-label')).toBe('1 star');
    expect(elements[4].getAttribute('aria-label')).toBe('5 stars');
  });

  it('checks the radio matching the value and fills its stars', () => {
    expect(inputFor(3).checked).toBe(true);

    const percents = fills().map(fill => fill.style.width);
    expect(percents).toEqual(['100%', '100%', '100%', '0%', '0%']);
  });

  it('renders a partial fill for a fractional value', async () => {
    component.value.set(4.3);
    await settle();

    expect(fills()[3].style.width).toBe('100%');
    expect(parseFloat(fills()[4].style.width)).toBeCloseTo(30);
  });

  it('commits an activation to the value model', async () => {
    await activate(5);

    expect(component.value()).toBe(5);
  });

  it('offers half-star options when allowed', async () => {
    component.allowHalf.set(true);
    await settle();

    expect(inputs().length).toBe(10);
    expect(inputFor(2.5).getAttribute('aria-label')).toBe('2.5 stars');

    await activate(2.5);

    expect(component.value()).toBe(2.5);
    expect(fills().map(fill => fill.style.width)).toEqual(['100%', '100%', '50%', '0%', '0%']);
  });

  it('clears the value when the current option is activated again', async () => {
    await activate(3);

    expect(component.value()).toBe(0);
    expect(inputs().every(input => !input.checked)).toBe(true);
  });

  it('keeps the value when clearing is not allowed', async () => {
    component.allowClear.set(false);
    await settle();

    await activate(3);

    expect(component.value()).toBe(3);
  });

  it('does not clear on the click that follows a fresh check', async () => {
    // A single user activation of an unchecked radio fires change then click;
    // the click alone must not immediately clear the value it just set.
    await activate(4);

    expect(component.value()).toBe(4);
  });

  it('reverts an activation while readonly, since a radio has no native readonly', async () => {
    component.readonly.set(true);
    await settle();

    await activate(5);

    expect(component.value()).toBe(3);
    expect(inputFor(3).checked).toBe(true);
    expect(inputFor(5).checked).toBe(false);
  });

  it('disables every radio and marks readonly for assistive technology', async () => {
    component.readonly.set(true);
    component.disabled.set(true);
    await settle();

    expect(host().getAttribute('aria-readonly')).toBe('true');
    expect(inputs().every(input => input.disabled)).toBe(true);
  });

  it('marks the control touched on blur', async () => {
    inputFor(1).dispatchEvent(new Event('blur'));
    await settle();

    expect(host().classList).toContain('tls-rating--touched');
  });

  it('previews the hovered option and restores the value on leave', async () => {
    inputFor(5).dispatchEvent(new Event('pointerenter'));
    await settle();

    expect(fills()[4].style.width).toBe('100%');

    host().dispatchEvent(new Event('pointerleave'));
    await settle();

    expect(fills()[4].style.width).toBe('0%');
  });

  it('drops an active hover preview when the control turns readonly mid-hover', async () => {
    inputFor(5).dispatchEvent(new Event('pointerenter'));
    await settle();

    expect(fills()[4].style.width).toBe('100%');

    component.readonly.set(true);
    await settle();

    expect(fills()[4].style.width).toBe('0%');
  });

  it('does not preview hover while readonly', async () => {
    component.readonly.set(true);
    await settle();

    inputFor(5).dispatchEvent(new Event('pointerenter'));
    await settle();

    expect(fills()[4].style.width).toBe('0%');
  });

  it('ghosts only the stars a hover would add, keeping the committed fill solid', async () => {
    component.preview.set(true);
    await settle();

    inputFor(5).dispatchEvent(new Event('pointerenter'));
    await settle();

    const solids = fills().map(fill => fill.style.width);
    const ghosts = ghostFills().map(fill => fill.style.width);
    expect(solids).toEqual(['100%', '100%', '100%', '0%', '0%']);
    expect(ghosts).toEqual(['100%', '100%', '100%', '100%', '100%']);
  });

  it('ghosts only the part a hover below the value would remove', async () => {
    component.preview.set(true);
    await settle();

    inputFor(1).dispatchEvent(new Event('pointerenter'));
    await settle();

    const solids = fills().map(fill => fill.style.width);
    const ghosts = ghostFills().map(fill => fill.style.width);
    expect(solids).toEqual(['100%', '0%', '0%', '0%', '0%']);
    expect(ghosts).toEqual(['100%', '100%', '100%', '0%', '0%']);
  });

  it('renders no ghost layer unless asked to', () => {
    expect(ghostFills().length).toBe(0);
  });

  it('pops the selected star and settles when its animation ends', async () => {
    await activate(5);

    const star = fixture.nativeElement.querySelectorAll('.tls-rating-star')[4] as HTMLElement;
    expect(star.classList).toContain('tls-rating-star--pop');

    star.dispatchEvent(new Event('animationend'));
    await settle();

    expect(star.classList).not.toContain('tls-rating-star--pop');
  });

  it('pops the star containing a selected half', async () => {
    component.allowHalf.set(true);
    await settle();

    await activate(2.5);

    const star = fixture.nativeElement.querySelectorAll('.tls-rating-star')[2] as HTMLElement;
    expect(star.classList).toContain('tls-rating-star--pop');
  });

  it('renders a consumer star template for every layer instead of the built-in icon', async () => {
    const templateFixture = TestBed.createComponent(TemplateHostComponent);
    templateFixture.detectChanges();
    await templateFixture.whenStable();

    expect(templateFixture.nativeElement.querySelector('tls-icon')).toBeNull();

    const allStars = templateFixture.nativeElement.querySelectorAll('.tls-rating-star');
    const layersOf = (star: Element): (string | undefined)[] =>
      Array.from(star.querySelectorAll('.custom-star')).map(layer => layer.textContent?.trim());

    // Empty, ghost-preview and solid-fill copies, with the third star at 2.5
    // flagged as half.
    expect(layersOf(allStars[0])).toEqual(['E1', 'F1P', 'F1']);
    expect(layersOf(allStars[2])).toEqual(['E3H', 'F3PH', 'F3H']);
  });

  it('hides the stars from assistive technology, since the radios announce the state', () => {
    const icons = fixture.nativeElement.querySelectorAll('.tls-rating-icons');
    expect(icons.length).toBe(5);
    for (const icon of Array.from(icons)) {
      expect((icon as HTMLElement).getAttribute('aria-hidden')).toBe('true');
    }
  });
});
