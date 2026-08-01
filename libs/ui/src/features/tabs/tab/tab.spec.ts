import { Component, viewChild } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Tabs } from '../tabs';
import { Tab } from './tab';

// The `tls-tab` host is a declarative holder that is never rendered into the DOM,
// so the instance is reached through a view query rather than `By.directive`.
@Component({
  imports: [Tabs, Tab],
  template: `
    <tls-tabs>
      <tls-tab value="tab-1" label="Tab 1">Content 1</tls-tab>
    </tls-tabs>
  `,
})
class TestHostComponent {
  readonly tab = viewChild.required(Tab);
}

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
class TestHostWithHeaderTemplateComponent {
  readonly tab = viewChild.required(Tab);
}

describe('Tab', () => {
  let fixture: ComponentFixture<TestHostComponent>;
  let component: Tab;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TestHostComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(TestHostComponent);
    await fixture.whenStable();
    component = fixture.componentInstance.tab();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should render the tab content inside the selected panel', () => {
    const panel = fixture.nativeElement.querySelector('.tls-tab') as HTMLElement;

    expect(panel).toBeTruthy();
    expect(panel.textContent).toContain('Content 1');
  });

  it('should not have a header template ref by default', () => {
    expect(component.headerTemplateRef()).toBeUndefined();
  });

  it('should expose the projected header template ref when provided', async () => {
    const templateFixture = TestBed.createComponent(TestHostWithHeaderTemplateComponent);
    await templateFixture.whenStable();

    expect(templateFixture.componentInstance.tab().headerTemplateRef()).toBeTruthy();
  });
});
