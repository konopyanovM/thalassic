import { buttonVariant } from '../../src/features/button/button.types';
import { fileInputVariant } from '../../src/features/form/file-input/file-input.types';
import { pinInputType } from '../../src/features/form/pin-input';
import { tabsVariant } from '../../src/features/tabs/tabs.types';
import { color, controlSize, orientation, overlayPosition } from '../../src/types';

export const STORY_COLOR_OPTIONS: color[] = [
  'primary',
  'secondary',
  'tertiary',
  'success',
  'info',
  'warning',
  'danger',
] as const;

export const STORY_VARIANT_OPTIONS: buttonVariant[] = [
  'filled',
  'outlined',
  'text',
  'elevated',
] as const;

export const STORY_ORIENTATION_OPTIONS: orientation[] = ['horizontal', 'vertical'] as const;

export const STORY_SIZE_OPTIONS: controlSize[] = ['sm', 'md', 'lg'] as const;

export const STORY_TABS_VARIANT_OPTIONS: tabsVariant[] = ['flat', 'outlined'] as const;

export const STORY_PIN_INPUT_TYPE_OPTIONS: pinInputType[] = ['numeric', 'alphanumeric'] as const;

export const STORY_FILE_INPUT_VARIANT_OPTIONS: fileInputVariant[] = ['dropzone', 'button'] as const;

export const STORY_OVERLAY_POSITION_OPTIONS: overlayPosition[] = [
  'top',
  'top-start',
  'top-end',
  'right',
  'right-start',
  'right-end',
  'bottom',
  'bottom-start',
  'bottom-end',
  'left',
  'left-start',
  'left-end',
  'top-left',
  'top-right',
  'bottom-left',
  'bottom-right',
];
