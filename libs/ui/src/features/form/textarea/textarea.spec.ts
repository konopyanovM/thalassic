import { CdkTextareaAutosize } from '@angular/cdk/text-field';
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

  const autosizeDirective = (): CdkTextareaAutosize =>
    fixture.debugElement.query(By.directive(CdkTextareaAutosize)).injector.get(CdkTextareaAutosize);

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('keeps the autosize directive disabled by default', () => {
    expect(autosizeDirective().enabled).toBe(false);
  });

  it('enables the autosize directive and maps rows/maxRows onto it', async () => {
    fixture.componentRef.setInput('autosize', true);
    fixture.componentRef.setInput('rows', 4);
    fixture.componentRef.setInput('maxRows', 10);
    await fixture.whenStable();

    const directive = autosizeDirective();
    expect(directive.enabled).toBe(true);
    expect(directive.minRows).toBe(4);
    expect(directive.maxRows).toBe(10);
  });

  it('suppresses the manual resize handle while autosizing', async () => {
    fixture.componentRef.setInput('resize', 'both');
    await fixture.whenStable();
    expect(component['effectiveResize']()).toBe('both');

    fixture.componentRef.setInput('autosize', true);
    await fixture.whenStable();
    expect(component['effectiveResize']()).toBe('none');
  });
});
