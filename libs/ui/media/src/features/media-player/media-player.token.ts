import { InjectionToken } from '@angular/core';
import { DEFAULT_MEDIA_PLAYER_CONFIG, MediaPlayerConfig } from './media-player.config';

export const MEDIA_PLAYER_CONFIG = new InjectionToken<MediaPlayerConfig>('MEDIA_PLAYER_CONFIG', {
  factory: () => DEFAULT_MEDIA_PLAYER_CONFIG,
});
