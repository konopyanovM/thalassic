import { badgeVariant } from '../../src/features/badge/badge.types';
import { buttonVariant } from '../../src/features/button/button.types';
import { chipVariant } from '../../src/features/chip/chip.types';
import { toggleButtonVariant } from '../../src/features/form/toggle-button/toggle-button.types';
import { toggleGroupVariant } from '../../src/features/form/toggle-group/toggle-group.types';
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
  'tonal',
  'outlined',
  'text',
  'elevated',
] as const;

export const STORY_ORIENTATION_OPTIONS: orientation[] = ['horizontal', 'vertical'] as const;

export const STORY_SIZE_OPTIONS: controlSize[] = ['sm', 'md', 'lg'] as const;

export const STORY_BADGE_VARIANT_OPTIONS: badgeVariant[] = ['filled', 'tonal'] as const;

export const STORY_CHIP_VARIANT_OPTIONS: chipVariant[] = [
  'filled',
  'tonal',
  'outlined',
  'text',
] as const;

export const STORY_TOGGLE_BUTTON_VARIANT_OPTIONS: toggleButtonVariant[] = [
  'filled',
  'tonal',
  'outlined',
  'text',
] as const;

export const STORY_TOGGLE_GROUP_VARIANT_OPTIONS: toggleGroupVariant[] = [
  'filled',
  'tonal',
] as const;

export const STORY_TABS_VARIANT_OPTIONS: tabsVariant[] = ['flat', 'outlined', 'segmented'] as const;

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
