import { argsToTemplate, Meta, StoryObj } from '@storybook/angular';
import {
  STORY_COLOR_OPTIONS,
  STORY_SIZE_OPTIONS,
  STORY_VARIANT_OPTIONS,
} from '../../../.storybook/constants';
import { Button as ButtonComponent } from './button';

const meta: Meta<ButtonComponent> = {
  component: ButtonComponent,
  title: 'Button',
  args: {
    label: 'Button',
    disabled: false,
    variant: 'filled',
    size: 'md',
    fluid: false,
    stretch: false,
    icon: false,
    fab: false,
    rounded: false,
  },
  argTypes: {
    color: {
      control: { type: 'select' },
      options: STORY_COLOR_OPTIONS,
    },
    variant: {
      control: { type: 'select' },
      options: STORY_VARIANT_OPTIONS,
    },
    size: {
      control: { type: 'select' },
      options: STORY_SIZE_OPTIONS,
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
