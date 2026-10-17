import { themeType } from '@thalassic/core';
import {
  colorRole,
  colorSpec,
  contrastRequirement,
  paletteName,
  RoleGroup,
  RoleTone,
  schemeVariant,
  SelectOption,
  ThemeSource,
} from './types';

/** Palettes in the order they are listed and exported. */
export const PALETTE_NAMES: paletteName[] = [
  'primary',
  'secondary',
  'tertiary',
  'neutral',
  'neutral-variant',
];

/**
 * Tones written into every exported palette map. Beyond the standard steps it
 * carries the in-between tones the surface roles read (4, 6, 12, 17, 22, 85,
 * 92, 94, 96), so one key set serves every palette.
 */
export const PALETTE_TONES: number[] = [
  0, 4, 5, 6, 10, 12, 15, 17, 20, 22, 25, 30, 35, 40, 50, 60, 70, 80, 85, 90, 92, 94, 95, 96, 98, 99,
  100,
];

/**
 * Palette tone behind every color role, per mode. Mirrors the role mapping of
 * the theme's `_colors.scss`, so the preview shows exactly what the exported
 * palettes produce there.
 */
export const ROLE_TONES: Record<themeType, Record<colorRole, RoleTone>> = {
  light: {
    primary: { palette: 'primary', tone: 40 },
    'on-primary': { palette: 'primary', tone: 100 },
    'primary-container': { palette: 'primary', tone: 90 },
    'on-primary-container': { palette: 'primary', tone: 30 },
    secondary: { palette: 'secondary', tone: 40 },
    'on-secondary': { palette: 'secondary', tone: 100 },
    'secondary-container': { palette: 'secondary', tone: 90 },
    'on-secondary-container': { palette: 'secondary', tone: 30 },
    tertiary: { palette: 'tertiary', tone: 40 },
    'on-tertiary': { palette: 'tertiary', tone: 100 },
    'tertiary-container': { palette: 'tertiary', tone: 90 },
    'on-tertiary-container': { palette: 'tertiary', tone: 30 },
    surface: { palette: 'neutral', tone: 98 },
    'on-surface': { palette: 'neutral', tone: 10 },
    'surface-variant': { palette: 'neutral-variant', tone: 90 },
    'on-surface-variant': { palette: 'neutral-variant', tone: 30 },
    'surface-container-lowest': { palette: 'neutral', tone: 100 },
    'surface-container-low': { palette: 'neutral', tone: 96 },
    'surface-container': { palette: 'neutral', tone: 94 },
    'surface-container-high': { palette: 'neutral', tone: 92 },
    'surface-container-highest': { palette: 'neutral', tone: 90 },
    outline: { palette: 'neutral-variant', tone: 50 },
    'outline-variant': { palette: 'neutral-variant', tone: 85 },
  },
  dark: {
    primary: { palette: 'primary', tone: 80 },
    'on-primary': { palette: 'primary', tone: 20 },
    'primary-container': { palette: 'primary', tone: 30 },
    'on-primary-container': { palette: 'primary', tone: 90 },
    secondary: { palette: 'secondary', tone: 80 },
    'on-secondary': { palette: 'secondary', tone: 20 },
    'secondary-container': { palette: 'secondary', tone: 30 },
    'on-secondary-container': { palette: 'secondary', tone: 90 },
    tertiary: { palette: 'tertiary', tone: 80 },
    'on-tertiary': { palette: 'tertiary', tone: 20 },
    'tertiary-container': { palette: 'tertiary', tone: 30 },
    'on-tertiary-container': { palette: 'tertiary', tone: 90 },
    surface: { palette: 'neutral', tone: 6 },
    'on-surface': { palette: 'neutral', tone: 90 },
    'surface-variant': { palette: 'neutral-variant', tone: 30 },
    'on-surface-variant': { palette: 'neutral-variant', tone: 80 },
    'surface-container-lowest': { palette: 'neutral', tone: 4 },
    'surface-container-low': { palette: 'neutral', tone: 10 },
    'surface-container': { palette: 'neutral', tone: 12 },
    'surface-container-high': { palette: 'neutral', tone: 17 },
    'surface-container-highest': { palette: 'neutral', tone: 22 },
    outline: { palette: 'neutral-variant', tone: 60 },
    'outline-variant': { palette: 'neutral-variant', tone: 20 },
  },
};

/** Role pairs checked for contrast, grouped as they are displayed. */
export const ROLE_GROUPS: RoleGroup[] = [
  {
    title: 'Primary',
    pairs: [
      { background: 'primary', foreground: 'on-primary', requirement: 'text' },
      { background: 'primary-container', foreground: 'on-primary-container', requirement: 'text' },
    ],
  },
  {
    title: 'Secondary',
    pairs: [
      { background: 'secondary', foreground: 'on-secondary', requirement: 'text' },
      { background: 'secondary-container', foreground: 'on-secondary-container', requirement: 'text' },
    ],
  },
  {
    title: 'Tertiary',
    pairs: [
      { background: 'tertiary', foreground: 'on-tertiary', requirement: 'text' },
      { background: 'tertiary-container', foreground: 'on-tertiary-container', requirement: 'text' },
    ],
  },
  {
    title: 'Surface',
    pairs: [
      { background: 'surface', foreground: 'on-surface', requirement: 'text' },
      { background: 'surface', foreground: 'primary', requirement: 'text' },
      { background: 'surface-variant', foreground: 'on-surface-variant', requirement: 'text' },
      { background: 'surface-container-lowest', foreground: 'on-surface', requirement: 'text' },
      { background: 'surface-container-low', foreground: 'on-surface', requirement: 'text' },
      { background: 'surface-container', foreground: 'on-surface', requirement: 'text' },
      { background: 'surface-container-high', foreground: 'on-surface', requirement: 'text' },
      { background: 'surface-container-highest', foreground: 'on-surface-variant', requirement: 'text' },
    ],
  },
  {
    title: 'Outline',
    pairs: [
      { background: 'surface', foreground: 'outline', requirement: 'non-text' },
      { background: 'surface', foreground: 'outline-variant', requirement: 'decorative' },
    ],
  },
];

/** Contrast ratio a pair needs for AA, per requirement; `0` when nothing is required. */
export const CONTRAST_AA: Record<contrastRequirement, number> = {
  text: 4.5,
  'non-text': 3,
  decorative: 0,
};

/** Contrast ratio text needs for AAA (WCAG 1.4.6). */
export const CONTRAST_AAA_TEXT = 7;

/** Scheme variants offered by the generator. */
export const SCHEME_VARIANT_OPTIONS: SelectOption<schemeVariant>[] = [
  { label: 'Tonal spot', value: 'tonal-spot' },
  { label: 'Neutral', value: 'neutral' },
  { label: 'Vibrant', value: 'vibrant' },
  { label: 'Expressive', value: 'expressive' },
  { label: 'Fidelity', value: 'fidelity' },
  { label: 'Content', value: 'content' },
  { label: 'Monochrome', value: 'monochrome' },
  { label: 'Rainbow', value: 'rainbow' },
  { label: 'Fruit salad', value: 'fruit-salad' },
];

/** Color spec revisions offered by the generator. */
export const COLOR_SPEC_OPTIONS: SelectOption<colorSpec>[] = [
  { label: '2021 · Material 3', value: '2021' },
  { label: '2025 · Material 3 Expressive', value: '2025' },
];

/** Source of the shipped thalassic theme; the generator starts from it and resets to it. */
export const DEFAULT_THEME_SOURCE: ThemeSource = {
  primary: '#00658d',
  secondary: '#52606b',
  tertiary: '#ac2471',
  neutral: null,
  variant: 'tonal-spot',
  spec: '2021',
  colorMatch: true,
};

/** Query params the theme source is mirrored into, so a theme survives a reload and can be shared. */
export const THEME_SOURCE_PARAMS: Record<keyof ThemeSource, string> = {
  primary: 'primary',
  secondary: 'secondary',
  tertiary: 'tertiary',
  neutral: 'neutral',
  variant: 'variant',
  spec: 'spec',
  colorMatch: 'match',
};

/** Quiet period before the URL is rewritten, so dragging a picker doesn't flood the history API. */
export const THEME_SOURCE_SYNC_DELAY = 300;

/** How long a copy button reads "Copied" after a successful copy, in ms. */
export const COPY_FEEDBACK_DURATION = 1600;

/** Id of the `<style>` element carrying the generated theme. */
export const THEME_STYLESHEET_ID = 'theme-generator-stylesheet';

/** Pattern of a six-digit `#rrggbb` color, either case. */
export const HEX_COLOR_PATTERN = /^#[0-9a-f]{6}$/i;

/** Text colors a tone swatch chooses between, whichever contrasts more with the swatch. */
export const SWATCH_INK = {
  /** Ink for dark swatches. */
  light: '#ffffff',
  /** Ink for light swatches. */
  dark: '#000000',
};

/** Class every themed preview scope carries; the generated stylesheet scopes each mode's roles under it. */
export const PREVIEW_SCOPE_CLASS = 'theme-generator-scope';

/** Surface container roles, lowest to highest, as the preview stacks them. */
export const SURFACE_LADDER: colorRole[] = [
  'surface-container-lowest',
  'surface-container-low',
  'surface-container',
  'surface-container-high',
  'surface-container-highest',
];

/** Segments offered by the preview's toggle group. */
export const PREVIEW_SEGMENTS: string[] = ['Day', 'Week', 'Month'];

/**
 * Root-level tokens that read a color role. A custom property referencing
 * another resolves where it is declared, so a scope re-declares these for them
 * to pick up the scope's roles instead of the page's.
 */
export const SCOPE_DERIVED_DECLARATIONS = '--control-focus-ring-color: var(--color-primary);';
