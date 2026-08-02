import { Component, signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Tab } from './tab/tab';
import { Tabs } from './tabs';
import { tabsHeaderAlign, tabsItemsAlign } from './tabs.types';

@Component({
  imports: [Tabs, Tab],
  template: `
    <tls-tabs [headerAlign]="headerAlign()" [itemsAlign]="itemsAlign()">
      <tls-tab value="tab-1" label="Tab 1">Content 1</tls-tab>
      <tls-tab value="tab-2" label="Tab 2">Content 2</tls-tab>
    </tls-tabs>
  `,
})
class AlignmentTestHostComponent {
  readonly headerAlign = signal<tabsHeaderAlign>('stretch');
  readonly itemsAlign = signal<tabsItemsAlign>('start');
}

describe('Tabs', () => {
  let component: Tabs;
  let fixture: ComponentFixture<Tabs>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Tabs]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Tabs);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

// Both alignments belong on the header strip rather than the tabs host, because
// the strip is the element that carries the two properties.
describe('Tabs alignment', () => {
  let fixture: ComponentFixture<AlignmentTestHostComponent>;
  let header: HTMLElement;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AlignmentTestHostComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(AlignmentTestHostComponent);
    await fixture.whenStable();
    header = fixture.nativeElement.querySelector('.tls-tab-header') as HTMLElement;
  });

  it('should default the header to stretch and its items to start', () => {
    expect(header.classList).toContain('tls-tab-header--align-stretch');
    expect(header.classList).toContain('tls-tab-header--items-start');
  });

  it('should reflect the header alignment onto the strip', async () => {
    fixture.componentInstance.headerAlign.set('center');
    await fixture.whenStable();

    expect(header.classList).toContain('tls-tab-header--align-center');
    expect(header.classList).not.toContain('tls-tab-header--align-stretch');
  });

  it('should reflect the items alignment onto the strip', async () => {
    fixture.componentInstance.itemsAlign.set('stretch');
    await fixture.whenStable();

    expect(header.classList).toContain('tls-tab-header--items-stretch');
    expect(header.classList).not.toContain('tls-tab-header--items-start');
  });

  it('should keep the alignment modifiers off the tabs host', () => {
    const host = fixture.nativeElement.querySelector('tls-tabs') as HTMLElement;

    expect(host.className).not.toContain('--align-');
    expect(host.className).not.toContain('--items-');
  });
});
