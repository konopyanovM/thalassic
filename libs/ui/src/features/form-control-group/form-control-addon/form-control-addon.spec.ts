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
});
