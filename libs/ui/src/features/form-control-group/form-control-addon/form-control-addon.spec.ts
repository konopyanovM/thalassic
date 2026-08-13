import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormControlAddon } from './form-control-addon';

describe('FormControlAddon', () => {
  let component: FormControlAddon;
  let fixture: ComponentFixture<FormControlAddon>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FormControlAddon],
    }).compileComponents();

    fixture = TestBed.createComponent(FormControlAddon);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should carry the block class', () => {
    expect(fixture.nativeElement.classList).toContain('tls-form-control-addon');
  });

  it('should not draw a divider by default', () => {
    expect(fixture.nativeElement.classList).not.toContain('tls-form-control-addon--divider');
  });

  it('should reflect the divider input onto the host', async () => {
    fixture.componentRef.setInput('divider', true);
    await fixture.whenStable();

    expect(fixture.nativeElement.classList).toContain('tls-form-control-addon--divider');

    fixture.componentRef.setInput('divider', false);
    await fixture.whenStable();

    expect(fixture.nativeElement.classList).not.toContain('tls-form-control-addon--divider');
  });

  it('should treat a bare attribute as enabled', async () => {
    fixture.componentRef.setInput('divider', '');
    await fixture.whenStable();

    expect(fixture.nativeElement.classList).toContain('tls-form-control-addon--divider');
  });
});
