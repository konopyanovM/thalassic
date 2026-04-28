import { buttonVariant } from '../../src/features/button/button.types';
import { pinInputType } from '../../src/features/form/pin-input';
import { tabsVariant } from '../../src/features/tabs/tabs.types';
import { color, controlSize } from '../../src/types';

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

export const STORY_SIZE_OPTIONS: controlSize[] = ['sm', 'md', 'lg'] as const;

export const STORY_TABS_VARIANT_OPTIONS: tabsVariant[] = ['flat', 'outlined'] as const;

export const STORY_PIN_INPUT_TYPE_OPTIONS: pinInputType[] = ['numeric', 'alphanumeric'] as const;
