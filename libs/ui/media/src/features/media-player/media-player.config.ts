import {
  DEFAULT_CONTROLS_HIDE_DELAY,
  DEFAULT_RATE_OPTIONS,
  DEFAULT_SEEK_STEP,
} from './media-player.constants';

/** Accessible names and visible copy of the player chrome, overridable for i18n. */
export interface MediaPlayerLabels {
  play: string;
  pause: string;
  replay: string;
  mute: string;
  unmute: string;
  volume: string;
  seek: string;
  /** Joins current and total time in the scrubber's `aria-valuetext`, e.g. "1:23 {timeSeparator} 4:05". */
  timeSeparator: string;
  settings: string;
  captions: string;
  captionsOff: string;
  playbackRate: string;
  quality: string;
  fullscreen: string;
  exitFullscreen: string;
  pictureInPicture: string;
  errorMessage: string;
  retry: string;
}

export interface MediaPlayerConfig {
  seekStep: number;
  rateOptions: number[];
  controlsHideDelay: number;
  preload: 'none' | 'metadata' | 'auto';
  labels: MediaPlayerLabels;
}

export const DEFAULT_MEDIA_PLAYER_CONFIG: MediaPlayerConfig = {
  seekStep: DEFAULT_SEEK_STEP,
  rateOptions: DEFAULT_RATE_OPTIONS,
  controlsHideDelay: DEFAULT_CONTROLS_HIDE_DELAY,
  preload: 'metadata',
  labels: {
    play: 'Play',
    pause: 'Pause',
    replay: 'Replay',
    mute: 'Mute',
    unmute: 'Unmute',
    volume: 'Volume',
    seek: 'Seek',
    timeSeparator: 'of',
    settings: 'Settings',
    captions: 'Captions',
    captionsOff: 'Off',
    playbackRate: 'Speed',
    quality: 'Quality',
    fullscreen: 'Enter fullscreen',
    exitFullscreen: 'Exit fullscreen',
    pictureInPicture: 'Picture in picture',
    errorMessage: 'The media could not be played.',
    retry: 'Retry',
  },
};
