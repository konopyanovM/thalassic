import { Injector, runInInjectionContext } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { FullscreenController } from './fullscreen-controller';

describe('FullscreenController', () => {
  const create = (): FullscreenController =>
    runInInjectionContext(TestBed.inject(Injector), () => new FullscreenController());

  it('reports support from the attached elements', () => {
    const controller = create();
    const container = document.createElement('div');
    const video = document.createElement('video');
    controller.attach(container, video);

    // jsdom implements neither the Fullscreen API nor Picture-in-Picture, so
    // both read as unsupported here; a real browser reports `true`.
    expect(controller.fullscreenSupported()).toBe(false);
    expect(controller.pictureInPictureSupported()).toBe(false);
  });

  it('tracks fullscreenchange from the document', () => {
    const controller = create();
    const container = document.createElement('div');
    controller.attach(container, document.createElement('video'));

    Object.defineProperty(document, 'fullscreenElement', { value: container, configurable: true });
    document.dispatchEvent(new Event('fullscreenchange'));
    expect(controller.fullscreen()).toBe(true);

    Object.defineProperty(document, 'fullscreenElement', { value: null, configurable: true });
    document.dispatchEvent(new Event('fullscreenchange'));
    expect(controller.fullscreen()).toBe(false);
  });
});
