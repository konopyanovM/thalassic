import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PolarAreaChart } from './polar-area-chart';

describe('PolarAreaChart', () => {
  let component: PolarAreaChart;
  let fixture: ComponentFixture<PolarAreaChart>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PolarAreaChart]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PolarAreaChart);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
