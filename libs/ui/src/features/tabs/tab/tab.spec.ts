import { Component } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { Tabs } from '../tabs';
import { Tab } from './tab';

@Component({
  imports: [Tabs, Tab],
  template: `
    <tls-tabs>
      <tls-tab value="tab-1" label="Tab 1">Content 1</tls-tab>
    </tls-tabs>
  `,
})
class TestHostComponent {}

describe('Tab', () => {
  let fixture: ComponentFixture<TestHostComponent>;
  let component: Tab;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TestHostComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(TestHostComponent);
    await fixture.whenStable();
    component = fixture.debugElement.query(By.directive(Tab)).componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
