import type { Meta, StoryObj } from '@storybook/angular';
import { STORY_FORM_CONTROL_ARGS, STORY_SIZE_OPTIONS } from '../../../../.storybook/constants';
import { Password as PasswordComponent } from './password';

const meta: Meta<PasswordComponent> = {
  component: PasswordComponent,
  title: 'Form/Password',
  args: {
    value: '',
    visible: false,
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

type Story = StoryObj<PasswordComponent>;

export const Password: Story = {
  args: {},
};
