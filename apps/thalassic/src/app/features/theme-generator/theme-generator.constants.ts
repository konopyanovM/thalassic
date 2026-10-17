import { themeType } from '@thalassic/core';
import {
  colorRole,
  colorSpec,
  contrastRequirement,
  paletteName,
  RoleGroup,
  RoleTones,
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
  0, 4, 5, 6, 10, 12, 15, 17, 20, 22, 25, 30, 35, 40, 50, 60, 70, 80, 85, 90, 92, 94, 95, 96, 98,
  99, 100,
];

/** Palette every color role reads its tone from. Mirrors the theme's `_roles.scss`. */
export const ROLE_PALETTES: Record<colorRole, paletteName> = {
  primary: 'primary',
  'on-primary': 'primary',
  'primary-container': 'primary',
  'on-primary-container': 'primary',
  secondary: 'secondary',
  'on-secondary': 'secondary',
  'secondary-container': 'secondary',
  'on-secondary-container': 'secondary',
  tertiary: 'tertiary',
  'on-tertiary': 'tertiary',
  'tertiary-container': 'tertiary',
  'on-tertiary-container': 'tertiary',
  surface: 'neutral',
  'on-surface': 'neutral',
  'surface-variant': 'neutral-variant',
  'on-surface-variant': 'neutral-variant',
  'surface-container-lowest': 'neutral',
  'surface-container-low': 'neutral',
  'surface-container': 'neutral',
  'surface-container-high': 'neutral',
  'surface-container-highest': 'neutral',
  outline: 'neutral-variant',
  'outline-variant': 'neutral-variant',
};

/**
 * Tone every color role reads from its palette by default, per mode. Mirrors
 * the theme's `_roles.scss`, so the preview shows exactly what the exported
 * theme produces there.
 */
export const DEFAULT_ROLE_TONES: Record<themeType, RoleTones> = {
  light: {
    primary: 40,
    'on-primary': 100,
    'primary-container': 90,
    'on-primary-container': 30,
    secondary: 40,
    'on-secondary': 100,
    'secondary-container': 90,
    'on-secondary-container': 30,
    tertiary: 40,
    'on-tertiary': 100,
    'tertiary-container': 90,
    'on-tertiary-container': 30,
    surface: 98,
    'on-surface': 10,
    'surface-variant': 90,
    'on-surface-variant': 30,
    'surface-container-lowest': 100,
    'surface-container-low': 96,
    'surface-container': 94,
    'surface-container-high': 92,
    'surface-container-highest': 90,
    outline: 50,
    'outline-variant': 85,
  },
  dark: {
    primary: 80,
    'on-primary': 20,
    'primary-container': 30,
    'on-primary-container': 90,
    secondary: 80,
    'on-secondary': 20,
    'secondary-container': 30,
    'on-secondary-container': 90,
    tertiary: 80,
    'on-tertiary': 20,
    'tertiary-container': 30,
    'on-tertiary-container': 90,
    surface: 6,
    'on-surface': 90,
    'surface-variant': 30,
    'on-surface-variant': 80,
    'surface-container-lowest': 4,
    'surface-container-low': 10,
    'surface-container': 12,
    'surface-container-high': 17,
    'surface-container-highest': 22,
    outline: 60,
    'outline-variant': 20,
  },
};

/** Lowest HCT tone, black. */
export const TONE_MIN = 0;

/** Highest HCT tone, white. */
export const TONE_MAX = 100;

/** Roles grouped as they are displayed: each group's tones, then its pairs checked for contrast. */
export const ROLE_GROUPS: RoleGroup[] = [
  {
    title: 'Primary',
    roles: ['primary', 'on-primary', 'primary-container', 'on-primary-container'],
    pairs: [
      { background: 'primary', foreground: 'on-primary', requirement: 'text' },
      { background: 'primary-container', foreground: 'on-primary-container', requirement: 'text' },
    ],
  },
  {
    title: 'Secondary',
    roles: ['secondary', 'on-secondary', 'secondary-container', 'on-secondary-container'],
    pairs: [
      { background: 'secondary', foreground: 'on-secondary', requirement: 'text' },
      {
        background: 'secondary-container',
        foreground: 'on-secondary-container',
        requirement: 'text',
      },
    ],
  },
  {
    title: 'Tertiary',
    roles: ['tertiary', 'on-tertiary', 'tertiary-container', 'on-tertiary-container'],
    pairs: [
      { background: 'tertiary', foreground: 'on-tertiary', requirement: 'text' },
      {
        background: 'tertiary-container',
        foreground: 'on-tertiary-container',
        requirement: 'text',
      },
    ],
  },
  {
    title: 'Surface',
    roles: [
      'surface',
      'on-surface',
      'surface-variant',
      'on-surface-variant',
      'surface-container-lowest',
      'surface-container-low',
      'surface-container',
      'surface-container-high',
      'surface-container-highest',
    ],
    pairs: [
      { background: 'surface', foreground: 'on-surface', requirement: 'text' },
      { background: 'surface', foreground: 'primary', requirement: 'text' },
      { background: 'surface-variant', foreground: 'on-surface-variant', requirement: 'text' },
      { background: 'surface-container-lowest', foreground: 'on-surface', requirement: 'text' },
      { background: 'surface-container-low', foreground: 'on-surface', requirement: 'text' },
      { background: 'surface-container', foreground: 'on-surface', requirement: 'text' },
      { background: 'surface-container-high', foreground: 'on-surface', requirement: 'text' },
      {
        background: 'surface-container-highest',
        foreground: 'on-surface-variant',
        requirement: 'text',
      },
    ],
  },
  {
    title: 'Outline',
    roles: ['outline', 'outline-variant'],
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
  roleTones: { light: {}, dark: {} },
};

/**
 * Query params the theme source is mirrored into, so a theme survives a reload
 * and can be shared. Role tones take one param per mode, in `ROLE_TONE_PARAMS`.
 */
export const THEME_SOURCE_PARAMS: Record<Exclude<keyof ThemeSource, 'roleTones'>, string> = {
  primary: 'primary',
  secondary: 'secondary',
  tertiary: 'tertiary',
  neutral: 'neutral',
  variant: 'variant',
  spec: 'spec',
  colorMatch: 'match',
};

/** Query param carrying the role tone overrides of each mode, as `role:tone` entries. */
export const ROLE_TONE_PARAMS: Record<themeType, string> = {
  light: 'light-tones',
  dark: 'dark-tones',
};

/** Separates the `role:tone` entries of a role tone param. */
export const ROLE_TONE_ENTRY_SEPARATOR = ',';

/** Separates a role from its tone within a role tone param entry. */
export const ROLE_TONE_VALUE_SEPARATOR = ':';

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
 * Root-level tokens that read a color role, per mode. A custom property
 * referencing another resolves where it is declared, so a scope re-declares
 * these for them to pick up the scope's roles instead of the page's — with the
 * mode's own value where a token differs by mode.
 */
export const SCOPE_DERIVED_DECLARATIONS: Record<themeType, string> = {
  light: [
    '--control-focus-ring-color: var(--color-primary);',
    '--field-background: var(--color-surface-container-lowest);',
  ].join('\n'),
  dark: [
    '--control-focus-ring-color: var(--color-primary);',
    '--field-background: var(--color-surface-container-high);',
  ].join('\n'),
};

/** Module a consumer loads the theme from; its palettes are configurable on that `@use`. */
export const THEME_MODULE = '@thalassic/themes/themes/thalassic';

/** Name of the generated Sass entry that configures the theme. */
export const THEME_CONFIG_FILE_NAME = 'styles.scss';

/** Name of the generated stylesheet that overrides the color roles. */
export const THEME_CSS_FILE_NAME = 'theme.css';
