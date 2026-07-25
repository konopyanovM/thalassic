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

@Component({
  imports: [Tabs, Tab],
  template: `
    <tls-tabs>
      <tls-tab value="tab-1" label="Tab 1">
        <ng-template #tabHeader>Custom header</ng-template>
        Content 1
      </tls-tab>
    </tls-tabs>
  `,
})
class TestHostWithHeaderTemplateComponent {}

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

  it('should not have a header template ref by default', () => {
    expect(component.headerTemplateRef()).toBeUndefined();
  });

  it('should expose the projected header template ref when provided', async () => {
    const templateFixture = TestBed.createComponent(TestHostWithHeaderTemplateComponent);
    await templateFixture.whenStable();

    const tabComponent = templateFixture.debugElement.query(By.directive(Tab))
      .componentInstance as Tab;

    expect(tabComponent.headerTemplateRef()).toBeTruthy();
  });
});
