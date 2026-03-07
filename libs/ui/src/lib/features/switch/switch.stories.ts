import type { Meta, StoryObj } from '@storybook/angular';
import { Switch } from './switch';

const meta: Meta<Switch> = {
  component: Switch,
  title: 'Switch',
  args: {
    color: 'primary',
    disabled: false,
  },
  argTypes: {
    color: {
      control: { type: 'select' },
      options: ['primary', 'secondary', 'tertiary', 'success', 'info', 'warning', 'danger'],
    },
  },
};
export default meta;

type Story = StoryObj<Switch>;

export const Base: Story = {
  args: {},
};
