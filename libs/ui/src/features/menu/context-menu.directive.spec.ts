import { OverlayContainer } from '@angular/cdk/overlay';
import { Component, signal, viewChild } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ContextMenuDirective } from './context-menu.directive';
import { Menu } from './menu';
import { MenuItemDefinition } from './menu.types';

@Component({
  imports: [Menu, ContextMenuDirective],
  template: `
    <div class="area" [tlsContextMenu]="menuRef">Right-click me</div>
    <tls-menu #menuRef [items]="items()" />
  `,
})
class HostComponent {
  public readonly items = signal<MenuItemDefinition[]>([{ type: 'item', label: 'First' }]);
  public readonly menu = viewChild.required(Menu);
}

/**
 * The context-menu directive opens the menu at the pointer on `contextmenu`;
 * these tests pin that delegation and the default-prevention of the native
 * browser menu.
 */
describe('ContextMenuDirective', () => {
  let fixture: ComponentFixture<HostComponent>;
  let host: HostComponent;
  let area: HTMLElement;
  let overlayContainer: OverlayContainer;
  let overlayContainerElement: HTMLElement;

  const queryPanel = () => overlayContainerElement.querySelector<HTMLElement>('.tls-menu');
  const rightClick = () => {
    const event = new MouseEvent('contextmenu', {
      bubbles: true,
      cancelable: true,
      clientX: 20,
      clientY: 40,
    });
    area.dispatchEvent(event);
    fixture.detectChanges();
    return event;
  };

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

    area = fixture.nativeElement.querySelector('.area');
  });

  afterEach(() => {
    overlayContainer.ngOnDestroy();
  });

  it('should open the menu and prevent the native context menu', () => {
    const event = rightClick();

    expect(host.menu().isOpen()).toBe(true);
    expect(queryPanel()).not.toBeNull();
    expect(event.defaultPrevented).toBe(true);
  });

  it('should reposition (close then reopen) on a subsequent right-click', () => {
    rightClick();
    expect(queryPanel()).not.toBeNull();

    rightClick();

    expect(host.menu().isOpen()).toBe(true);
    expect(overlayContainerElement.querySelectorAll('.tls-menu').length).toBe(1);
  });
});
