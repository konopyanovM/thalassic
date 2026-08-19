import { DestroyRef, DOCUMENT, inject, Injectable, signal, Signal } from '@angular/core';

/**
 * Fullscreen and Picture-in-Picture state for a video player: fullscreen is
 * requested on the player container (so the chrome stays visible), PiP on the
 * video element itself. Feature support is detected per element at attach, so
 * the chrome can hide unavailable buttons.
 */
@Injectable()
export class FullscreenController {
  // Injections
  private readonly _document = inject(DOCUMENT);
  private readonly _destroyRef = inject(DestroyRef);

  // State
  private _container: HTMLElement | null = null;
  private _video: HTMLVideoElement | null = null;
  private readonly _fullscreen = signal(false);
  private readonly _pictureInPicture = signal(false);
  private readonly _fullscreenSupported = signal(false);
  private readonly _pictureInPictureSupported = signal(false);

  public readonly fullscreen: Signal<boolean> = this._fullscreen.asReadonly();
  public readonly pictureInPicture: Signal<boolean> = this._pictureInPicture.asReadonly();
  public readonly fullscreenSupported: Signal<boolean> = this._fullscreenSupported.asReadonly();
  public readonly pictureInPictureSupported: Signal<boolean> =
    this._pictureInPictureSupported.asReadonly();

  // Public methods
  public attach(container: HTMLElement, video: HTMLVideoElement): void {
    this._container = container;
    this._video = video;
    this._fullscreenSupported.set(typeof container.requestFullscreen === 'function');
    this._pictureInPictureSupported.set('requestPictureInPicture' in video);

    const onFullscreenChange = (): void =>
      this._fullscreen.set(this._document.fullscreenElement === container);
    this._document.addEventListener('fullscreenchange', onFullscreenChange);
    this._destroyRef.onDestroy(() =>
      this._document.removeEventListener('fullscreenchange', onFullscreenChange),
    );

    const onEnterPip = (): void => this._pictureInPicture.set(true);
    const onLeavePip = (): void => this._pictureInPicture.set(false);
    video.addEventListener('enterpictureinpicture', onEnterPip);
    video.addEventListener('leavepictureinpicture', onLeavePip);
    this._destroyRef.onDestroy(() => {
      video.removeEventListener('enterpictureinpicture', onEnterPip);
      video.removeEventListener('leavepictureinpicture', onLeavePip);
    });
  }

  public async toggleFullscreen(): Promise<void> {
    if (!this._container) return;
    if (this._fullscreen()) {
      await this._document.exitFullscreen();
      return;
    }
    await this._container.requestFullscreen();
  }

  public async togglePictureInPicture(): Promise<void> {
    const video = this._video;
    if (!video) return;
    if (this._pictureInPicture()) {
      await this._document.exitPictureInPicture();
      return;
    }
    await video.requestPictureInPicture();
  }
}
