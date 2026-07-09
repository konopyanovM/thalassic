import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Calendar } from './calendar';

describe('Calendar', () => {
  let component: Calendar;
  let fixture: ComponentFixture<Calendar>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Calendar],
    }).compileComponents();

    fixture = TestBed.createComponent(Calendar);
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
