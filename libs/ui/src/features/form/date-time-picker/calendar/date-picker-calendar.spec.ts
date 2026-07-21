import { ComponentFixture, TestBed } from '@angular/core/testing';
import { DatePickerCalendar } from './date-picker-calendar';

describe('DatePickerCalendar', () => {
  let component: DatePickerCalendar;
  let fixture: ComponentFixture<DatePickerCalendar>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DatePickerCalendar],
    }).compileComponents();

    fixture = TestBed.createComponent(DatePickerCalendar);
    fixture.componentRef.setInput('viewDate', new Date(2024, 0, 1));
    fixture.componentRef.setInput('selectedDate', null);
    fixture.componentRef.setInput('weekStartsOn', 0);
    fixture.componentRef.setInput('weekDays', ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa']);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
