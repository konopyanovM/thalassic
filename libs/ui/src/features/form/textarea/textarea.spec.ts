import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { Textarea } from './textarea';

describe('Textarea', () => {
  let component: Textarea;
  let fixture: ComponentFixture<Textarea>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Textarea],
    }).compileComponents();

    fixture = TestBed.createComponent(Textarea);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  const textarea = (): HTMLTextAreaElement =>
    fixture.debugElement.query(By.css('textarea')).nativeElement;

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('does not autosize by default', () => {
    expect(textarea().classList).not.toContain('tls-form-control--autosize');
  });

  it('marks the control as autosizing and publishes the row bounds', async () => {
    fixture.componentRef.setInput('autosize', true);
    fixture.componentRef.setInput('rows', 4);
    fixture.componentRef.setInput('maxRows', 10);
    await fixture.whenStable();

    const element = textarea();
    expect(element.classList).toContain('tls-form-control--autosize');
    expect(element.classList).toContain('tls-form-control--autosize-capped');
    expect(element.style.getPropertyValue('--tls-textarea-rows')).toBe('4');
    expect(element.style.getPropertyValue('--tls-textarea-max-rows')).toBe('10');
  });

  it('leaves the height uncapped when maxRows is zero', async () => {
    fixture.componentRef.setInput('autosize', true);
    await fixture.whenStable();

    expect(textarea().classList).not.toContain('tls-form-control--autosize-capped');
  });

  it('exposes the requested resize mode to the stylesheet', async () => {
    fixture.componentRef.setInput('resize', 'both');
    fixture.componentRef.setInput('autosize', true);
    await fixture.whenStable();

    expect(textarea().style.getPropertyValue('--tls-textarea-resize')).toBe('both');
  });
});
