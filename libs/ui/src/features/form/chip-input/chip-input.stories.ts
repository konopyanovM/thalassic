import type { Meta, StoryObj } from '@storybook/angular';
import { STORY_FORM_CONTROL_ARGS, STORY_SIZE_OPTIONS } from '../../../../.storybook/constants';
import { ChipInput } from './chip-input';

const meta: Meta<ChipInput> = {
  component: ChipInput,
  title: 'Form/ChipInput',
  args: {
    value: ['Angular', 'TypeScript'],
    placeholder: 'Add tag...',
    size: 'md',
    fluid: false,
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

type Story = StoryObj<ChipInput>;

export const ChipInputStory: Story = {
  name: 'ChipInput',
  args: {},
};
