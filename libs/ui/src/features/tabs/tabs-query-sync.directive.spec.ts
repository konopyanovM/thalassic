import { Component, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { provideRouter, Router, RouterOutlet } from '@angular/router';
import { RouterTestingHarness } from '@angular/router/testing';
import { Tab } from './tab';
import { Tabs } from './tabs';
import { TabsQuerySyncDirective } from './tabs-query-sync.directive';
import { tabValue } from './tabs.types';

@Component({
  imports: [RouterOutlet, Tab, Tabs, TabsQuerySyncDirective],
  template: `
    <tls-tabs [(selected)]="selected" tlsTabsQuerySync>
      <tls-tab value="first" label="First" />
      <tls-tab value="second" label="Second" />
    </tls-tabs>
    <router-outlet />
  `,
})
class TabsPage {
  readonly selected = signal<tabValue | undefined>('first');
}

@Component({ template: 'detail' })
class DetailPage {}

describe('TabsQuerySyncDirective', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideRouter([
          {
            path: 'page',
            component: TabsPage,
            children: [{ path: 'detail/:id', component: DetailPage }],
          },
        ]),
      ],
    });
  });

  const select = async (harness: RouterTestingHarness, page: TabsPage): Promise<void> => {
    page.selected.set('second');
    harness.detectChanges();
    await harness.fixture.whenStable();
  };

  it('writes the selected tab into the address', async () => {
    const harness = await RouterTestingHarness.create();
    const page = await harness.navigateByUrl('/page', TabsPage);
    harness.detectChanges();

    await select(harness, page);

    expect(TestBed.inject(Router).url).toBe('/page?tab=second');
  });

  it('keeps the child route that is open, changing only the query', async () => {
    const harness = await RouterTestingHarness.create();
    const page = await harness.navigateByUrl('/page/detail/7', TabsPage);
    harness.detectChanges();

    await select(harness, page);

    expect(TestBed.inject(Router).url).toBe('/page/detail/7?tab=second');
  });
});
