import { OverlayContainer } from '@angular/cdk/overlay';
import { Component, signal, viewChild } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { overlayPosition } from '../../types';
import { Popover } from './popover';

@Component({
  imports: [Popover],
  template: `
    <button #trigger type="button">Trigger</button>
    <tls-popover [position]="position()" [ariaLabel]="ariaLabel()">
      <p class="popover-content">Content</p>
    </tls-popover>
  `,
})
class HostComponent {
  public readonly position = signal<overlayPosition>('bottom');
  public readonly ariaLabel = signal<string | undefined>(undefined);
  public readonly popover = viewChild.required(Popover);
}

/**
 * Characterization tests for the overlay lifecycle that Popover owns. These pin
 * down the externally observable behavior (open/close/toggle, Escape, backdrop,
 * destroy, a11y wiring) so the planned extraction of a shared overlay primitive
 * can be verified to preserve it.
 */
describe('Popover', () => {
  let fixture: ComponentFixture<HostComponent>;
  let host: HostComponent;
  let trigger: HTMLButtonElement;
  let overlayContainer: OverlayContainer;
  let overlayContainerElement: HTMLElement;

  const getPopover = () => host.popover();
  const queryPanel = () => overlayContainerElement.querySelector<HTMLElement>('.tls-popover');
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
    expect(getPopover()).toBeTruthy();
  });

  it('should start closed with nothing in the overlay container', () => {
    expect(getPopover().isOpen()).toBe(false);
    expect(queryPanel()).toBeNull();
  });

  it('should assign a unique id per instance', () => {
    const secondFixture = TestBed.createComponent(HostComponent);
    secondFixture.detectChanges();

    expect(getPopover().id).not.toBe(secondFixture.componentInstance.popover().id);
    secondFixture.destroy();
  });

  describe('open', () => {
    it('should attach the projected content and flip isOpen when opened with an element', () => {
      getPopover().open(trigger);
      fixture.detectChanges();

      expect(getPopover().isOpen()).toBe(true);
      const panel = queryPanel();
      expect(panel).not.toBeNull();
      expect(panel?.querySelector('.popover-content')?.textContent).toContain('Content');
    });

    it('should open from a MouseEvent using its currentTarget as the origin', () => {
      const event = new MouseEvent('click');
      Object.defineProperty(event, 'currentTarget', { value: trigger });

      getPopover().open(event);
      fixture.detectChanges();

      expect(getPopover().isOpen()).toBe(true);
      expect(queryPanel()).not.toBeNull();
    });

    it('should be a no-op when already open (no duplicate panel)', () => {
      getPopover().open(trigger);
      getPopover().open(trigger);
      fixture.detectChanges();

      expect(overlayContainerElement.querySelectorAll('.tls-popover').length).toBe(1);
    });

    it('should render dialog a11y attributes and reflect the id', () => {
      getPopover().open(trigger);
      fixture.detectChanges();

      const panel = queryPanel();
      expect(panel?.getAttribute('role')).toBe('dialog');
      expect(panel?.getAttribute('aria-modal')).toBe('false');
      expect(panel?.id).toBe(getPopover().id);
    });

    it('should expose aria-label when provided', () => {
      host.ariaLabel.set('Calendar');
      fixture.detectChanges();

      getPopover().open(trigger);
      fixture.detectChanges();

      expect(queryPanel()?.getAttribute('aria-label')).toBe('Calendar');
    });

    it('should render a backdrop', () => {
      getPopover().open(trigger);
      fixture.detectChanges();

      expect(queryBackdrop()).not.toBeNull();
    });
  });

  describe('close', () => {
    it('should remove the panel and flip isOpen', () => {
      getPopover().open(trigger);
      fixture.detectChanges();

      getPopover().close();
      fixture.detectChanges();

      expect(getPopover().isOpen()).toBe(false);
      expect(queryPanel()).toBeNull();
    });

    it('should be a no-op when already closed', () => {
      expect(() => getPopover().close()).not.toThrow();
      expect(getPopover().isOpen()).toBe(false);
    });

    it('should close on backdrop click', () => {
      getPopover().open(trigger);
      fixture.detectChanges();

      queryBackdrop()?.click();
      fixture.detectChanges();

      expect(getPopover().isOpen()).toBe(false);
      expect(queryPanel()).toBeNull();
    });

    it('should close on Escape', () => {
      getPopover().open(trigger);
      fixture.detectChanges();

      queryPanel()?.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));
      fixture.detectChanges();

      expect(getPopover().isOpen()).toBe(false);
      expect(queryPanel()).toBeNull();
    });

    it('should not close on other keys', () => {
      getPopover().open(trigger);
      fixture.detectChanges();

      queryPanel()?.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true }));
      fixture.detectChanges();

      expect(getPopover().isOpen()).toBe(true);
    });
  });

  describe('toggle', () => {
    it('should open when closed and close when open', () => {
      getPopover().toggle(trigger);
      fixture.detectChanges();
      expect(getPopover().isOpen()).toBe(true);

      getPopover().toggle(trigger);
      fixture.detectChanges();
      expect(getPopover().isOpen()).toBe(false);
    });
  });

  it('should dispose the overlay when the host is destroyed while open', () => {
    getPopover().open(trigger);
    fixture.detectChanges();
    expect(queryPanel()).not.toBeNull();

    fixture.destroy();

    expect(queryPanel()).toBeNull();
  });
});
