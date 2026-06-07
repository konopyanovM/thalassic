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
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
