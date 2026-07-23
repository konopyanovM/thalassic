import { OverlayContainer } from '@angular/cdk/overlay';
import { Component, signal, viewChild } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Menu } from './menu';
import { MenuItemDefinition } from './menu.types';

@Component({
  imports: [Menu],
  template: `
    <button #trigger type="button">Trigger</button>
    <tls-menu [items]="items()" [inline]="inline()" [ariaLabel]="ariaLabel()" />
  `,
})
class HostComponent {
  public readonly clicks: string[] = [];
  public readonly items = signal<MenuItemDefinition[]>([
    { type: 'item', label: 'First', action: () => this.clicks.push('First') },
    { type: 'divider' },
    { type: 'item', label: 'Second', action: () => this.clicks.push('Second') },
  ]);
  public readonly inline = signal(false);
  public readonly ariaLabel = signal<string | undefined>(undefined);
  public readonly menu = viewChild.required(Menu);
}

/**
 * Characterization tests for the overlay lifecycle that Menu currently
 * re-implements on top of the CDK Overlay (anchored open, open-at-point with
 * outside-pointer dismissal, inline mode, Escape/backdrop dismissal). These pin
 * the observable behavior so it survives the planned extraction of a shared
 * overlay primitive.
 */
describe('Menu', () => {
  let fixture: ComponentFixture<HostComponent>;
  let host: HostComponent;
  let trigger: HTMLButtonElement;
  let overlayContainer: OverlayContainer;
  let overlayContainerElement: HTMLElement;

  const getMenu = () => host.menu();
  const queryPanel = () => overlayContainerElement.querySelector<HTMLElement>('.tls-menu');
  const queryItems = () =>
    Array.from(overlayContainerElement.querySelectorAll<HTMLButtonElement>('.tls-menu__item'));
  const queryBackdrop = () =>
    overlayContainerElement.querySelector<HTMLElement>('.cdk-overlay-backdrop');

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

  it('should create', () => {
    expect(getMenu()).toBeTruthy();
  });

  it('should assign a unique id per instance', () => {
    const secondFixture = TestBed.createComponent(HostComponent);
    secondFixture.detectChanges();

    expect(getMenu().id).not.toBe(secondFixture.componentInstance.menu().id);
    secondFixture.destroy();
  });

  it('should start closed', () => {
    expect(getMenu().isOpen()).toBe(false);
    expect(queryPanel()).toBeNull();
  });

  describe('open (anchored)', () => {
    it('should attach the panel and flip isOpen', () => {
      getMenu().open(trigger);
      fixture.detectChanges();

      expect(getMenu().isOpen()).toBe(true);
      expect(queryPanel()).not.toBeNull();
    });

    it('should render an item per action definition', () => {
      getMenu().open(trigger);
      fixture.detectChanges();

      const items = queryItems();
      expect(items.length).toBe(2);
      expect(items[0].textContent).toContain('First');
    });

    it('should expose menu role and aria-label', () => {
      host.ariaLabel.set('Actions');
      fixture.detectChanges();

      getMenu().open(trigger);
      fixture.detectChanges();

      const panel = queryPanel();
      expect(panel?.getAttribute('role')).toBe('menu');
      expect(panel?.getAttribute('aria-label')).toBe('Actions');
    });

    it('should render a backdrop', () => {
      getMenu().open(trigger);
      fixture.detectChanges();

      expect(queryBackdrop()).not.toBeNull();
    });

    it('should be a no-op when already open', () => {
      getMenu().open(trigger);
      getMenu().open(trigger);
      fixture.detectChanges();

      expect(overlayContainerElement.querySelectorAll('.tls-menu').length).toBe(1);
    });

    it('should run the action and close when an item is clicked', () => {
      getMenu().open(trigger);
      fixture.detectChanges();

      queryItems()[0].click();
      fixture.detectChanges();

      expect(host.clicks).toEqual(['First']);
      expect(getMenu().isOpen()).toBe(false);
    });
  });

  describe('dismissal', () => {
    it('should close on backdrop click', () => {
      getMenu().open(trigger);
      fixture.detectChanges();

      queryBackdrop()?.click();
      fixture.detectChanges();

      expect(getMenu().isOpen()).toBe(false);
      expect(queryPanel()).toBeNull();
    });

    it('should close on Escape', () => {
      getMenu().open(trigger);
      fixture.detectChanges();

      queryPanel()?.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));
      fixture.detectChanges();

      expect(getMenu().isOpen()).toBe(false);
    });
  });

  describe('toggle', () => {
    it('should open then close', () => {
      getMenu().toggle(trigger);
      fixture.detectChanges();
      expect(getMenu().isOpen()).toBe(true);

      getMenu().toggle(trigger);
      fixture.detectChanges();
      expect(getMenu().isOpen()).toBe(false);
    });
  });

  describe('openAtPoint (context menu)', () => {
    it('should attach the panel without a backdrop', () => {
      getMenu().openAtPoint(20, 40);
      fixture.detectChanges();

      expect(getMenu().isOpen()).toBe(true);
      expect(queryPanel()).not.toBeNull();
      expect(queryBackdrop()).toBeNull();
    });

    it('should close on an outside click', () => {
      getMenu().openAtPoint(20, 40);
      fixture.detectChanges();

      document.body.dispatchEvent(new MouseEvent('click', { bubbles: true }));
      fixture.detectChanges();

      expect(getMenu().isOpen()).toBe(false);
    });

    it('should ignore only the trailing auxclick of the opening right-click', () => {
      // The right-click that opens the menu ends with an `auxclick`; that first
      // trailing `auxclick` must not dismiss the menu the instant it appears...
      getMenu().openAtPoint(20, 40);
      fixture.detectChanges();

      document.body.dispatchEvent(new MouseEvent('auxclick', { bubbles: true }));
      fixture.detectChanges();
      expect(getMenu().isOpen()).toBe(true);

      // ...but a later outside `auxclick` (a separate gesture) still dismisses.
      document.body.dispatchEvent(new MouseEvent('auxclick', { bubbles: true }));
      fixture.detectChanges();
      expect(getMenu().isOpen()).toBe(false);
    });
  });

  describe('inline mode', () => {
    beforeEach(async () => {
      // `inline` is read in ngOnInit, so it must be set before the first CD.
      fixture = TestBed.createComponent(HostComponent);
      host = fixture.componentInstance;
      host.inline.set(true);
      fixture.detectChanges();
      await fixture.whenStable();
      trigger = fixture.nativeElement.querySelector('button');
    });

    it('should render the panel in place and report open without an anchor', () => {
      expect(getMenu().isOpen()).toBe(true);
      expect(fixture.nativeElement.querySelector('.tls-menu')).not.toBeNull();
    });

    it('should ignore open() while inline', () => {
      getMenu().open(trigger);
      fixture.detectChanges();

      // No overlay panel is created; the in-place one remains.
      expect(queryPanel()).toBeNull();
    });
  });

  it('should dispose the overlay when destroyed while open', () => {
    getMenu().open(trigger);
    fixture.detectChanges();
    expect(queryPanel()).not.toBeNull();

    fixture.destroy();

    expect(queryPanel()).toBeNull();
  });

  describe('keyboard navigation', () => {
    beforeEach(() => {
      host.items.set([
        { type: 'item', label: 'First', action: () => host.clicks.push('First') },
        { type: 'item', label: 'Disabled', disabled: true, action: () => host.clicks.push('Disabled') },
        { type: 'item', label: 'Second', action: () => host.clicks.push('Second') },
      ]);
      fixture.detectChanges();

      getMenu().open(trigger);
      fixture.detectChanges();
    });

    const dispatchKey = (key: string): void => {
      queryPanel()?.dispatchEvent(new KeyboardEvent('keydown', { key, bubbles: true }));
      fixture.detectChanges();
    };

    it('should move roving focus to the next item on ArrowDown, skipping the disabled one', () => {
      // The default active item on open is already 'First' (unfocused), so the
      // first ArrowDown advances past the disabled item straight to 'Second'.
      dispatchKey('ArrowDown');
      expect(document.activeElement?.textContent).toContain('Second');

      dispatchKey('ArrowUp');
      expect(document.activeElement?.textContent).toContain('First');
    });

    it('should move roving focus to the last item on End', () => {
      dispatchKey('End');
      expect(document.activeElement?.textContent).toContain('Second');
    });

    it('should run the action and close on Enter', () => {
      dispatchKey('Home');
      dispatchKey('Enter');

      expect(host.clicks).toEqual(['First']);
      expect(getMenu().isOpen()).toBe(false);
    });
  });
});
