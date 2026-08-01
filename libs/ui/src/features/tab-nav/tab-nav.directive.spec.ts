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
});
