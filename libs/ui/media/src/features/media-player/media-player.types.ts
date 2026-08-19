/**
 * Lifecycle of an attached media element, collapsed to the single state the
 * chrome renders: exactly one of poster, spinner, playing surface, replay
 * affordance, or error panel is showing at a time.
 */
export type mediaState = 'idle' | 'loading' | 'ready' | 'playing' | 'ended' | 'error';

/** One contiguous buffered span of the media timeline, in seconds. */
export interface TimeRange {
  start: number;
  end: number;
}

/** A text track of the media element, projected for the captions menu. */
export interface MediaTextTrack {
  id: string;
  label: string;
  language: string;
  active: boolean;
}

/** A selectable quality rendition reported by a {@link MediaSourceEngine}. */
export interface MediaLevel {
  id: string;
  height: number;
  bitrate: number;
  label: string;
}

/** A captions/subtitles source rendered as a `<track>` element. */
export interface MediaCaptionSource {
  src: string;
  srclang: string;
  label: string;
  default?: boolean;
}
