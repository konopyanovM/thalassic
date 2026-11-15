import { OverlayContainer } from '@angular/cdk/overlay';
import { Component, signal, viewChild } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Button } from '../button';
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

@Component({
  imports: [Button, Menu, MenuTriggerDirective],
  template: `
    <tls-button [tlsMenuTrigger]="menuRef">Language</tls-button>
    <tls-menu #menuRef [items]="items" />
  `,
})
class ButtonHostComponent {
  public readonly items: MenuItemDefinition[] = [
    { type: 'item', label: 'English', role: 'menuitemradio', checked: false },
    { type: 'item', label: 'Русский', role: 'menuitemradio', checked: true },
  ];
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
    // A closed menu has no element to point at.
    expect(trigger.getAttribute('aria-controls')).toBeNull();

    trigger.click();
    fixture.detectChanges();

    expect(trigger.getAttribute('aria-controls')).toBe(host.menu().id);
  });

  it('should hand focus back to the trigger when Escape closes the menu', async () => {
    trigger.focus();
    trigger.click();
    fixture.detectChanges();
    await fixture.whenStable();

    document.activeElement?.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));
    fixture.detectChanges();
    await fixture.whenStable();

    expect(host.menu().isOpen()).toBe(false);
    expect(document.activeElement).toBe(trigger);
  });

  it('should hand focus back to the trigger once an item is chosen', async () => {
    trigger.focus();
    trigger.click();
    fixture.detectChanges();
    await fixture.whenStable();

    (document.activeElement as HTMLElement).click();
    fixture.detectChanges();
    await fixture.whenStable();

    expect(document.activeElement).toBe(trigger);
  });

  it('should move focus to the first item once the menu is shown', async () => {
    trigger.click();
    fixture.detectChanges();
    await fixture.whenStable();

    expect(document.activeElement?.textContent?.trim()).toBe('First');
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

  describe('on a tls-button', () => {
    let buttonFixture: ComponentFixture<ButtonHostComponent>;
    let buttonHost: HTMLElement;
    let control: HTMLButtonElement;

    beforeEach(async () => {
      buttonFixture = TestBed.createComponent(ButtonHostComponent);
      buttonFixture.detectChanges();
      await buttonFixture.whenStable();

      buttonHost = buttonFixture.nativeElement.querySelector('tls-button');
      control = buttonHost.querySelector('button') as HTMLButtonElement;
    });

    it('should announce the menu on the inner control that takes focus, not on the wrapper', () => {
      expect(control.getAttribute('aria-haspopup')).toBe('menu');
      expect(control.getAttribute('aria-expanded')).toBe('false');
      expect(buttonHost.getAttribute('aria-haspopup')).toBeNull();
      expect(buttonHost.getAttribute('aria-expanded')).toBeNull();

      control.click();
      buttonFixture.detectChanges();

      expect(control.getAttribute('aria-expanded')).toBe('true');
      expect(control.getAttribute('aria-controls')).toBe(buttonFixture.componentInstance.menu().id);
    });

    it('should start a choice on its checked answer', async () => {
      control.click();
      buttonFixture.detectChanges();
      await buttonFixture.whenStable();

      expect(document.activeElement?.textContent?.trim()).toBe('Русский');
    });
  });
});
