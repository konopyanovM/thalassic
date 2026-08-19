import { componentWrapperDecorator, type Meta, type StoryObj } from '@storybook/angular';
import { MediaCaptionSource } from '../media-player.types';
import { VideoPlayer } from './video-player';

// Wikimedia's Big Buck Bunny 720p transcode: true 16:9 (fills the player frame
// edge-to-edge), a modern VP9 encode, ten minutes long, and an audio track with
// verified audible content — the trifecta no other stable public sample offers.
// Rejected alternatives: the W3C Sintel trailer (2.35:1 letterbox baked into
// the pixels), the W3C bunny movie (2010-era encode that trips a decode error
// in current Chrome), test-videos.co.uk files (no audio track at all), and
// MDN's flower clip (its audio track decodes to digital silence).
const BUNNY_MOVIE_SOURCE =
  'https://upload.wikimedia.org/wikipedia/commons/transcoded/c/c0/Big_Buck_Bunny_4K.webm/Big_Buck_Bunny_4K.webm.720p.vp9.webm';
const BUNNY_POSTER_SOURCE =
  'https://upload.wikimedia.org/wikipedia/commons/thumb/c/c5/Big_buck_bunny_poster_big.jpg/960px-Big_buck_bunny_poster_big.jpg';
const NOT_FOUND_SOURCE = 'https://media.w3.org/2010/05/bunny/does-not-exist.mp4';

const ENGLISH_CAPTION_TRACK: MediaCaptionSource = {
  src: 'data:text/vtt;charset=utf-8,WEBVTT%0A%0A00:00.000 --> 00:04.000%0AHello',
  srclang: 'en',
  label: 'English',
  default: true,
};

const meta: Meta<VideoPlayer> = {
  component: VideoPlayer,
  title: 'Media/Video Player',
  // The player fills its container; unconstrained on a wide canvas its 16:9
  // box grows taller than the viewport, so the stories frame it. Layout
  // direction is stamped on the document root exactly as DirectionService does
  // in an app — the theme's RTL overrides and CDK Directionality both read the
  // root, so per-story direction must land there (and reset on story switch).
  decorators: [
    (story, context) => {
      document.documentElement.dir = (context.parameters['direction'] as string) ?? 'ltr';
      return story();
    },
    componentWrapperDecorator(
      (story) => `<div style="max-width: 860px; margin-inline: auto;">${story}</div>`,
    ),
  ],
  args: {
    source: BUNNY_MOVIE_SOURCE,
    title: undefined,
    poster: undefined,
    captions: [],
    autoplay: false,
    loop: false,
    muted: false,
    preload: 'metadata',
    ariaLabel: 'Big Buck Bunny',
  },
  argTypes: {
    preload: {
      control: { type: 'select' },
      options: ['none', 'metadata', 'auto'],
    },
  },
};
export default meta;

type Story = StoryObj<VideoPlayer>;

export const Default: Story = {
  args: {},
};

export const WithPoster: Story = {
  args: {
    poster: BUNNY_POSTER_SOURCE,
  },
};

/** Browsers only honor autoplay when the element is also muted; a rejected unmuted request degrades to poster + play affordance. */
export const MutedAutoplay: Story = {
  args: {
    poster: BUNNY_POSTER_SOURCE,
    autoplay: true,
    muted: true,
  },
};

export const Captions: Story = {
  args: {
    captions: [ENGLISH_CAPTION_TRACK],
  },
};

/** A source that 404s, driving the controller into its `error` state and surfacing the retry panel. */
export const ErrorState: Story = {
  args: {
    source: NOT_FOUND_SOURCE,
  },
};

/**
 * The player in a right-to-left layout, exercising the feature's
 * logical-property styling and direction-resolved pointer math. Direction is
 * applied to the document root (see the meta decorator) — the theme's RTL
 * overrides key on `:root[dir='rtl']` and CDK `Directionality` reads the root,
 * so a wrapper `dir` attribute alone would render a broken half-flipped state
 * no real app produces.
 */
export const RTL: Story = {
  parameters: { direction: 'rtl' },
};
