import { Meta, StoryObj } from '@storybook/angular';
import { STORY_FORM_CONTROL_ARGS, STORY_SIZE_OPTIONS } from '../../../../.storybook/constants';
import { size } from '../../../types';
import { ColorSwatchPicker as ColorSwatchPickerComponent } from './color-swatch-picker';

const SIZE_OPTIONS: size[] = ['xs', ...STORY_SIZE_OPTIONS, 'xl'];

const meta: Meta<ColorSwatchPickerComponent> = {
  component: ColorSwatchPickerComponent,
  title: 'Form/Color Swatch Picker',
  args: {
    colors: [
      '#ef4444',
      '#f97316',
      '#eab308',
      '#22c55e',
      '#14b8a6',
      '#3b82f6',
      '#8b5cf6',
      '#ec4899',
    ],
    value: '#3b82f6',
    size: 'xs',
    ...STORY_FORM_CONTROL_ARGS,
  },
  argTypes: {
    size: {
      control: { type: 'select' },
      options: SIZE_OPTIONS,
    },
  },
};
export default meta;

type Story = StoryObj<ColorSwatchPickerComponent>;

export const Default: Story = {
  args: {},
};

export const Translucent: Story = {
  args: {
    colors: ['#ef444480', '#22c55e80', '#3b82f680', '#8b5cf680'],
    value: '#3b82f680',
  },
};
