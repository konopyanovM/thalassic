import { Component } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter, Router, RouterLink, RouterLinkActive } from '@angular/router';
import { TabLinkDirective } from './tab-link.directive';
import { TabNavDirective } from './tab-nav.directive';

@Component({
  imports: [TabNavDirective, TabLinkDirective, RouterLink, RouterLinkActive],
  template: `
    <nav tlsTabNav aria-label="Test sections">
      <a tlsTabLink routerLink="/first" routerLinkActive>First</a>
      <a tlsTabLink routerLink="/second" routerLinkActive>Second</a>
      <a tlsTabLink routerLink="/third" routerLinkActive disabled>Third</a>
    </nav>
  `,
})
class TestHost {}

@Component({
  imports: [TabNavDirective, TabLinkDirective, RouterLink, RouterLinkActive],
  template: `
    <nav tlsTabNav divider aria-label="Divided sections">
      <a tlsTabLink routerLink="/first" routerLinkActive>First</a>
      <a tlsTabLink routerLink="/second" routerLinkActive>Second</a>
    </nav>
  `,
})
class DividedTestHost {}

@Component({
  imports: [TabNavDirective, TabLinkDirective, RouterLink, RouterLinkActive],
  template: `
    <nav tlsTabNav itemsAlign="stretch" aria-label="Stretched sections">
      <a tlsTabLink routerLink="/first" routerLinkActive>First</a>
      <a tlsTabLink routerLink="/second" routerLinkActive>Second</a>
    </nav>
  `,
})
class AlignedTestHost {}

describe('TabNavDirective', () => {
  let fixture: ComponentFixture<TestHost>;
  let navigation: HTMLElement;
  let links: HTMLAnchorElement[];

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TestHost],
      providers: [provideRouter([{ path: '**', children: [] }])],
    }).compileComponents();

    fixture = TestBed.createComponent(TestHost);
    await fixture.whenStable();

    navigation = fixture.nativeElement.querySelector('nav');
    links = Array.from(fixture.nativeElement.querySelectorAll('a'));
  });

  it('applies the shared tab-header classes with default variant and orientation', () => {
    expect(navigation.classList).toContain('tls-tab-nav');
    expect(navigation.classList).toContain('tls-tab-header');
    expect(navigation.classList).toContain('tls-tab-header--flat');
    expect(navigation.classList).toContain('tls-tab-header--horizontal');
    expect(navigation.classList).toContain('tls-tab-header--items-start');
  });

  // The strip's own placement is the consumer's layout concern, so only the
  // distribution of the links inside it is exposed as an input here.
  it('reflects the items alignment and carries no strip alignment modifier', async () => {
    const alignedFixture = TestBed.createComponent(AlignedTestHost);
    await alignedFixture.whenStable();

    const alignedNavigation: HTMLElement = alignedFixture.nativeElement.querySelector('nav');

    expect(alignedNavigation.classList).toContain('tls-tab-header--items-stretch');
    expect(alignedNavigation.className).not.toContain('--align-');
  });

  it('marks each link as both tab-header item and control', () => {
    for (const link of links) {
      expect(link.classList).toContain('tls-tab-header__item');
      expect(link.classList).toContain('tls-tab-header__item-control');
    }
  });

  it('reflects the router-active link via class and aria-current', async () => {
    await TestBed.inject(Router).navigateByUrl('/first');
    await fixture.whenStable();

    expect(links[0].classList).toContain('tls-tab-header__item--active');
    expect(links[0].getAttribute('aria-current')).toBe('page');
    expect(links[1].classList).not.toContain('tls-tab-header__item--active');
    expect(links[1].getAttribute('aria-current')).toBeNull();
  });

  it('exposes a disabled link to assistive technology and removes it from the tab order', () => {
    expect(links[2].getAttribute('aria-disabled')).toBe('true');
    expect(links[2].getAttribute('tabindex')).toBe('-1');
    expect(links[2].classList).toContain('tls-tab-header__item--disabled');
  });

  it('prevents navigation from a disabled link', () => {
    const clickEvent = new MouseEvent('click', { cancelable: true });
    links[2].dispatchEvent(clickEvent);

    expect(clickEvent.defaultPrevented).toBe(true);
  });

  it('omits the divided modifier by default', () => {
    expect(navigation.classList).not.toContain('tls-tab-header--divided');
  });

  it('reflects the divider option as a strip-level modifier class', async () => {
    const dividedFixture = TestBed.createComponent(DividedTestHost);
    await dividedFixture.whenStable();

    const dividedNavigation: HTMLElement = dividedFixture.nativeElement.querySelector('nav');

    expect(dividedNavigation.classList).toContain('tls-tab-header--divided');
  });
});
