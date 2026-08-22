import { Meta, StoryObj } from '@storybook/angular';
import { STORY_FORM_CONTROL_ARGS, STORY_SIZE_OPTIONS } from '../../../../.storybook/constants';
import { ColorPicker as ColorPickerComponent } from './color-picker';

const meta: Meta<ColorPickerComponent> = {
  component: ColorPickerComponent,
  title: 'Form/Color Picker',
  args: {
    value: '#3b82f6',
    alpha: false,
    size: 'md',
    ...STORY_FORM_CONTROL_ARGS,
  },
  argTypes: {
    size: {
      control: { type: 'select' },
      options: STORY_SIZE_OPTIONS,
    },
  },
};
export default meta;

type Story = StoryObj<ColorPickerComponent>;

export const Basic: Story = {
  args: {},
};

export const WithAlpha: Story = {
  args: {
    alpha: true,
    value: '#3b82f680',
  },
};

export const HexOnly: Story = {
  args: {
    formats: ['hex'],
  },
};

export const WithPresets: Story = {
  args: {
    presets: [
      '#ef4444',
      '#f97316',
      '#eab308',
      '#22c55e',
      '#14b8a6',
      '#3b82f6',
      '#8b5cf6',
      '#ec4899',
    ],
  },
};

