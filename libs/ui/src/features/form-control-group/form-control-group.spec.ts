import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormControlGroup } from './form-control-group';

describe('FormControlGroup', () => {
  let component: FormControlGroup;
  let fixture: ComponentFixture<FormControlGroup>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FormControlGroup],
    }).compileComponents();

    fixture = TestBed.createComponent(FormControlGroup);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
