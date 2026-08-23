import { ComponentFixture, TestBed } from '@angular/core/testing';
import { PickerField } from './picker-field';

describe('PickerField', () => {
  let component: PickerField;
  let fixture: ComponentFixture<PickerField>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PickerField],
    }).compileComponents();

    fixture = TestBed.createComponent(PickerField);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('marks the host open while the consumer panel is open', () => {
    fixture.componentRef.setInput('open', true);
    fixture.detectChanges();

    expect(fixture.nativeElement.classList).toContain('tls-picker-field--open');
  });

  it('disables the trigger with the field', () => {
    fixture.componentRef.setInput('disabled', true);
    fixture.detectChanges();

    const trigger: HTMLButtonElement = fixture.nativeElement.querySelector('button');
    expect(trigger.disabled).toBe(true);
  });
});
