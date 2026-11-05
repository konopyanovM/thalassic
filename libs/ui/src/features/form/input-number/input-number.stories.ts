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
    variant: 'outlined',
    fluid: false,
    step: 1,
    ...STORY_FORM_CONTROL_ARGS,
  },
  argTypes: {
    size: {
      control: { type: 'select' },
      options: STORY_SIZE_OPTIONS,
    },
    variant: {
      control: { type: 'select' },
      options: ['outlined', 'plain'],
    },
  },
};
export default meta;

type Story = StoryObj<InputNumber>;

export const InputNumberStory: Story = {
  name: 'InputNumber',
  args: {},
};

export const Plain: Story = {
  args: { variant: 'plain', value: 60 },
};

/** A fractional step takes decimals, typed with either separator and shown in the page's locale. */
export const Decimal: Story = {
  args: { value: 62.5, step: 0.5, min: 0 },
};
