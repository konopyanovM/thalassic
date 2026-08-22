import { Meta, StoryObj } from '@storybook/angular';
import { STORY_FORM_CONTROL_ARGS, STORY_SIZE_OPTIONS } from '../../../../.storybook/constants';
import { ColorRange as ColorRangeComponent } from './color-range';
import { colorRangeChannel, colorRangeSize } from './color-range.types';

const CHANNEL_OPTIONS: colorRangeChannel[] = ['hue', 'alpha'];
const SIZE_OPTIONS: colorRangeSize[] = ['xs', ...STORY_SIZE_OPTIONS];

const meta: Meta<ColorRangeComponent> = {
  component: ColorRangeComponent,
  title: 'Form/Color Range',
  args: {
    channel: 'hue',
    value: 180,
    color: '#3b82f6',
    size: 'md',
    fluid: false,
    ...STORY_FORM_CONTROL_ARGS,
  },
  argTypes: {
    channel: {
      control: { type: 'select' },
      options: CHANNEL_OPTIONS,
    },
    size: {
      control: { type: 'select' },
      options: SIZE_OPTIONS,
    },
    color: {
      control: { type: 'color' },
    },
  },
};
export default meta;

type Story = StoryObj<ColorRangeComponent>;

export const Hue: Story = {
  args: {},
};

export const Alpha: Story = {
  args: {
    channel: 'alpha',
    value: 50,
  },
};
