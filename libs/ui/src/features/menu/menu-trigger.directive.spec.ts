import { OverlayContainer } from '@angular/cdk/overlay';
import { Component, signal, viewChild } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Menu } from './menu';
import { MenuTriggerDirective } from './menu-trigger.directive';
import { MenuItemDefinition } from './menu.types';

@Component({
  imports: [Menu, MenuTriggerDirective],
  template: `
    <button [tlsMenuTrigger]="menuRef">Open</button>
    <tls-menu #menuRef [items]="items()" />
  `,
})
class HostComponent {
  public readonly items = signal<MenuItemDefinition[]>([{ type: 'item', label: 'First' }]);
  public readonly menu = viewChild.required(Menu);
}

/**
 * The trigger directive is how a menu's overlay is opened/closed from a host
 * element; these tests pin its delegation to the menu and its a11y wiring.
 */
describe('MenuTriggerDirective', () => {
  let fixture: ComponentFixture<HostComponent>;
  let host: HostComponent;
  let trigger: HTMLButtonElement;
  let overlayContainer: OverlayContainer;
  let overlayContainerElement: HTMLElement;

  const queryPanel = () => overlayContainerElement.querySelector<HTMLElement>('.tls-menu');

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HostComponent],
    }).compileComponents();

    overlayContainer = TestBed.inject(OverlayContainer);
    overlayContainerElement = overlayContainer.getContainerElement();

    fixture = TestBed.createComponent(HostComponent);
    host = fixture.componentInstance;
    fixture.detectChanges();
    await fixture.whenStable();

    trigger = fixture.nativeElement.querySelector('button');
  });

  afterEach(() => {
    overlayContainer.ngOnDestroy();
  });

  it('should expose menu a11y attributes wired to the menu', () => {
    expect(trigger.getAttribute('aria-haspopup')).toBe('menu');
    expect(trigger.getAttribute('aria-expanded')).toBe('false');
    expect(trigger.getAttribute('aria-controls')).toBe(host.menu().id);
  });

  it('should open the menu on click and reflect aria-expanded', () => {
    trigger.click();
    fixture.detectChanges();

    expect(host.menu().isOpen()).toBe(true);
    expect(queryPanel()).not.toBeNull();
    expect(trigger.getAttribute('aria-expanded')).toBe('true');
  });

  it('should toggle the menu closed on a second click', () => {
    trigger.click();
    fixture.detectChanges();
    trigger.click();
    fixture.detectChanges();

    expect(host.menu().isOpen()).toBe(false);
    expect(queryPanel()).toBeNull();
  });
});
