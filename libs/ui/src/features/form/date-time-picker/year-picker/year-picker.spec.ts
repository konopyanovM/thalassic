import { ComponentFixture, TestBed } from '@angular/core/testing';
import { YearPicker } from './year-picker';

describe('YearPicker', () => {
  let component: YearPicker;
  let fixture: ComponentFixture<YearPicker>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [YearPicker],
    }).compileComponents();

    fixture = TestBed.createComponent(YearPicker);
    fixture.componentRef.setInput('viewDate', new Date(2024, 0, 1));
    fixture.componentRef.setInput('selectedDate', null);
    fixture.componentRef.setInput('yearsPerPage', 12);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
