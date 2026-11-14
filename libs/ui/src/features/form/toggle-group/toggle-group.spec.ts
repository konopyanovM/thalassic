import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ToggleGroup } from './toggle-group';

describe('ToggleGroup', () => {
  let component: ToggleGroup<string, string>;
  let fixture: ComponentFixture<ToggleGroup<string, string>>;

  const host = (): HTMLElement => fixture.nativeElement;

  const optionFor = (label: string): HTMLButtonElement => {
    const option = Array.from(host().querySelectorAll('button')).find(
      candidate => candidate.textContent.trim() === label,
    );
    if (!option) throw new Error(`No ${label} option`);
    return option;
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ToggleGroup],
    }).compileComponents();

    fixture = TestBed.createComponent<ToggleGroup<string, string>>(ToggleGroup);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('options', ['Day', 'Week', 'Month']);
    fixture.componentRef.setInput('value', ['Week']);
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('draws the joined, filled treatment unless told otherwise', () => {
    expect(host().classList).toContain('tls-toggle-group--filled');
    expect(host().classList).not.toContain('tls-toggle-group--segmented');
  });

  describe('segmented', () => {
    beforeEach(async () => {
      fixture.componentRef.setInput('variant', 'segmented');
      await fixture.whenStable();
    });

    it('carries the treatment in place of the one it replaces', () => {
      expect(host().classList).toContain('tls-toggle-group--segmented');
      expect(host().classList).not.toContain('tls-toggle-group--filled');
    });

    it('still reports each option as pressed or not, whatever marks it on screen', () => {
      expect(optionFor('Week').getAttribute('aria-pressed')).toBe('true');
      expect(optionFor('Day').getAttribute('aria-pressed')).toBe('false');
    });

    it('moves the selection to the option pressed', async () => {
      optionFor('Month').click();
      await fixture.whenStable();

      expect(component.value()).toEqual(['Month']);
      expect(optionFor('Month').classList).toContain('tls-toggle-group__option--selected');
      expect(optionFor('Week').classList).not.toContain('tls-toggle-group__option--selected');
    });

    it('keeps its treatment alongside an orientation and a width', async () => {
      fixture.componentRef.setInput('orientation', 'vertical');
      fixture.componentRef.setInput('fluid', true);
      await fixture.whenStable();

      expect(host().classList).toContain('tls-toggle-group--segmented');
      expect(host().classList).toContain('tls-toggle-group--vertical');
      expect(host().classList).toContain('tls-toggle-group--fluid');
    });
  });
});
