import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TabsService } from '../tabs.service';
import { Tab } from './tab';

describe('Tab', () => {
  let component: Tab;
  let fixture: ComponentFixture<Tab>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Tab],
      providers: [TabsService],
    })
    .compileComponents();

    fixture = TestBed.createComponent(Tab);
    fixture.componentRef.setInput('value', 'tab-1');
    fixture.componentRef.setInput('label', 'Tab 1');
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
