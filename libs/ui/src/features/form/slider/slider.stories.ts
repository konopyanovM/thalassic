import type { Meta, StoryObj } from '@storybook/angular';
import {
  STORY_COLOR_OPTIONS,
  STORY_FORM_CONTROL_ARGS,
  STORY_SIZE_OPTIONS,
} from '../../../../.storybook/constants';
import { Slider } from './slider';

const meta: Meta<Slider> = {
  component: Slider,
  title: 'Form/Slider',
  args: {
    value: 50,
    min: 0,
    max: 100,
    step: 1,
    color: 'primary',
    size: 'md',
    fluid: false,
    showTooltip: false,
    ...STORY_FORM_CONTROL_ARGS,
  },
  argTypes: {
    color: {
      control: { type: 'select' },
      options: STORY_COLOR_OPTIONS,
    },
    size: {
      control: { type: 'select' },
      options: STORY_SIZE_OPTIONS,
    },
  },
};
export default meta;

type Story = StoryObj<Slider>;

export const SliderStory: Story = {
  name: 'Slider',
  args: {},
};
