import { OverlayContainer } from '@angular/cdk/overlay';
import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { DialogService } from './dialog.service';

@Component({ template: '<p>Dialog content</p>' })
class DialogContentComponent {}

describe('DialogService', () => {
  let service: DialogService;
  let overlayContainer: OverlayContainer;
  let overlayContainerElement: HTMLElement;

  const queryPane = () => overlayContainerElement.querySelector<HTMLElement>('.cdk-overlay-pane');

  beforeEach(async () => {
    await TestBed.configureTestingModule({}).compileComponents();
    service = TestBed.inject(DialogService);
    overlayContainer = TestBed.inject(OverlayContainer);
    overlayContainerElement = overlayContainer.getContainerElement();
  });

  afterEach(() => {
    overlayContainer.ngOnDestroy();
  });

  it('should create', () => {
    expect(service).toBeTruthy();
  });

  describe('panelClass', () => {
    it('should place a named class on the overlay pane beside its own', () => {
      service.open(DialogContentComponent, { panelClass: 'tinted' });
      TestBed.tick();

      const pane = queryPane();
      expect(pane?.classList.contains('tinted')).toBe(true);
      expect(pane?.classList.contains('cdk-overlay-pane')).toBe(true);
      expect(pane?.querySelector('.tls-dialog')).not.toBeNull();
    });

    it('should place every class of a named list on the overlay pane', () => {
      service.open(DialogContentComponent, { panelClass: ['tinted', 'is-wide'] });
      TestBed.tick();

      const pane = queryPane();
      expect(pane?.classList.contains('tinted')).toBe(true);
      expect(pane?.classList.contains('is-wide')).toBe(true);
    });

    it('should add no class to the pane when none is named', () => {
      service.open(DialogContentComponent);
      TestBed.tick();

      expect(queryPane()?.className).toBe('cdk-overlay-pane');
    });
  });
});
