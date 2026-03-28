import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormItem } from './form-item';

describe('FormItem', () => {
  let component: FormItem;
  let fixture: ComponentFixture<FormItem>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FormItem],
    }).compileComponents();

    fixture = TestBed.createComponent(FormItem);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
