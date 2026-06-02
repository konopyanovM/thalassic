import type { Meta, StoryObj } from '@storybook/angular';
import { STORY_FORM_CONTROL_ARGS, STORY_SIZE_OPTIONS } from '../../../../.storybook/constants';
import { Input as InputComponent } from './input';

const meta: Meta<InputComponent> = {
  component: InputComponent,
  title: 'Form/Input',
  args: {
    value: '',
    placeholder: 'Some text',
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

type Story = StoryObj<InputComponent>;

export const Input: Story = {
  args: {},
};
