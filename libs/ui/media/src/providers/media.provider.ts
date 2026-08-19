import { EnvironmentProviders, makeEnvironmentProviders } from '@angular/core';
import { deepMerge } from '@thalassic/core';
import {
  DEFAULT_MEDIA_PLAYER_CONFIG,
  MediaPlayerConfig,
  MediaPlayerLabels,
} from '../features/media-player/media-player.config';
import { MEDIA_PLAYER_CONFIG } from '../features/media-player/media-player.token';

/** Consumer-facing override shape: every field optional, `labels` deep-partial. */
export interface MediaPlayerConfigOverride
  extends Partial<Omit<MediaPlayerConfig, 'labels'>> {
  labels?: Partial<MediaPlayerLabels>;
}

export const provideThalassicMediaConfig = (
  config: MediaPlayerConfigOverride = {},
): EnvironmentProviders =>
  makeEnvironmentProviders([
    {
      provide: MEDIA_PLAYER_CONFIG,
      // `labels` is a deep-partial override; deepMerge merges it recursively, but its
      // `Partial<T>` signature only models a shallow partial, so cast to it.
      useValue: deepMerge(DEFAULT_MEDIA_PLAYER_CONFIG, config as Partial<MediaPlayerConfig>),
    },
  ]);
