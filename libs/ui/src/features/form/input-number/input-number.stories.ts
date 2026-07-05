import type { Meta, StoryObj } from '@storybook/angular';
import { STORY_FORM_CONTROL_ARGS, STORY_SIZE_OPTIONS } from '../../../../.storybook/constants';
import { InputNumber } from './input-number';

const meta: Meta<InputNumber> = {
  component: InputNumber,
  title: 'Form/InputNumber',
  args: {
    value: null,
    placeholder: '0',
    size: 'md',
    fluid: false,
    step: 1,
    hideArrows: true,
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

type Story = StoryObj<InputNumber>;

export const InputNumberStory: Story = {
  name: 'InputNumber',
  args: {},
};
