import { argsToTemplate, Meta, StoryObj } from '@storybook/angular';
import { Button } from './button';

const meta: Meta<Button> = {
  component: Button,
  title: 'Button',
  args: {
    label: 'Button',
    disabled: false,
    appearance: 'filled',
    size: 'md',
  },
  argTypes: {
    color: {
      control: { type: 'select' },
      options: ['primary', 'secondary', 'tertiary', 'success', 'info', 'warning', 'danger'],
    },
    appearance: {
      control: { type: 'select' },
      options: ['filled', 'outlined', 'text', 'elevated'],
    },
    size: {
      control: { type: 'select' },
      options: ['sm', 'md', 'lg'],
    },
  },
  render: args => ({
    props: args,
    template: `<tls-button ${argsToTemplate(args)} />`,
  }),
};
export default meta;

type Story = StoryObj<Button>;

export const Primary: Story = {
  args: {
    color: 'primary',
  },
};

export const Secondary: Story = {
  args: {
    color: 'secondary',
  },
};

export const Tertiary: Story = {
  args: {
    color: 'tertiary',
  },
};

export const Success: Story = {
  args: {
    color: 'success',
  },
};

export const Info: Story = {
  args: {
    color: 'info',
  },
};

export const Warning: Story = {
  args: {
    color: 'warning',
  },
};

export const Danger: Story = {
  args: {
    color: 'danger',
  },
};
