import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ScatterChart } from './scatter-chart';

describe('ScatterChart', () => {
  let component: ScatterChart;
  let fixture: ComponentFixture<ScatterChart>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ScatterChart]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ScatterChart);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
