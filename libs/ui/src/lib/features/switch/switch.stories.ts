import type { Meta, StoryObj } from '@storybook/angular';
import { COLOR_OPTIONS } from '../../../../.storybook/arg-options';
import { Switch as SwitchComponent } from './switch';

const meta: Meta<SwitchComponent> = {
  component: SwitchComponent,
  title: 'Form/Switch',
  args: {
    color: 'primary',
    disabled: false,
    readonly: false,
  },
  argTypes: {
    color: {
      control: { type: 'select' },
      options: COLOR_OPTIONS,
    },
  },
};
export default meta;

type Story = StoryObj<SwitchComponent>;

export const Switch: Story = {
  args: {},
};
