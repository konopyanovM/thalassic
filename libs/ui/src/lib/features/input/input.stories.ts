import type { Meta, StoryObj } from '@storybook/angular';
import { SIZE_OPTIONS } from '../../../../.storybook/arg-options';
import { Input as InputComponent } from './input';

const meta: Meta<InputComponent> = {
  component: InputComponent,
  title: 'Form/Input',
  args: {
    placeholder: 'Some text',
    size: 'md',
    disabled: false,
    readonly: false,
  },
  argTypes: {
    size: {
      control: { type: 'select' },
      options: SIZE_OPTIONS,
    },
  },
};
export default meta;

type Story = StoryObj<InputComponent>;

export const Input: Story = {
  args: {},
};
