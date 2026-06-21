import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ToggleGroup } from './toggle-group';

describe('ToggleGroup', () => {
  let component: ToggleGroup;
  let fixture: ComponentFixture<ToggleGroup>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ToggleGroup],
    }).compileComponents();

    fixture = TestBed.createComponent(ToggleGroup);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
