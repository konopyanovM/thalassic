import { argsToTemplate, Meta, StoryObj } from '@storybook/angular';
import {
  APPEARANCE_OPTIONS,
  COLOR_OPTIONS,
  SIZE_OPTIONS,
} from '../../../../.storybook/arg-options';
import { Button as ButtonComponent } from './button';

const meta: Meta<ButtonComponent> = {
  component: ButtonComponent,
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
      options: COLOR_OPTIONS,
    },
    appearance: {
      control: { type: 'select' },
      options: APPEARANCE_OPTIONS,
    },
    size: {
      control: { type: 'select' },
      options: SIZE_OPTIONS,
    },
  },
  render: args => ({
    props: args,
    template: `<tls-button ${argsToTemplate(args)} />`,
  }),
};
export default meta;

type Story = StoryObj<ButtonComponent>;

export const Button: Story = {
  args: {
    color: 'primary',
  },
};
