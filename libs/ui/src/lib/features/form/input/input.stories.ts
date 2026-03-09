import type { Meta, StoryObj } from '@storybook/angular';
import { STORY_SIZE_OPTIONS } from '../../../../../.storybook/constants';
import { STORY_FORM_CONTROL_ARGS } from '../../../../../.storybook/constants/form-control-args';
import { Input as InputComponent } from './input';

const meta: Meta<InputComponent> = {
  component: InputComponent,
  title: 'Form/Input',
  args: {
    value: '',
    placeholder: 'Some text',
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

type Story = StoryObj<InputComponent>;

export const Input: Story = {
  args: {},
};
