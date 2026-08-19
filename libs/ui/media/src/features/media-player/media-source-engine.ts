import { InjectionToken, Signal } from '@angular/core';
import { MediaLevel } from './media-player.types';

/**
 * Attaches non-progressive sources (MSE-based streaming such as HLS or DASH)
 * to a media element. The library ships no implementation; an application
 * provides one and the controller delegates whenever `canPlay` accepts the
 * source, otherwise it assigns `media.src` directly.
 */
export interface MediaSourceEngine {
  canPlay(source: string): boolean;
  attach(media: HTMLMediaElement, source: string): void;
  detach(): void;
  /** Quality renditions of the attached source; the settings menu renders them when non-empty. */
  levels?: Signal<MediaLevel[]>;
}

export const MEDIA_SOURCE_ENGINE = new InjectionToken<MediaSourceEngine>('MEDIA_SOURCE_ENGINE');
