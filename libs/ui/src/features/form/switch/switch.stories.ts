import type { Meta, StoryObj } from '@storybook/angular';
import { STORY_COLOR_OPTIONS, STORY_FORM_CONTROL_ARGS } from '../../../../.storybook/constants';
import { Switch as SwitchComponent } from './switch';

const meta: Meta<SwitchComponent> = {
  component: SwitchComponent,
  title: 'Form/Switch',
  args: {
    color: 'primary',
    checked: false,
    ...STORY_FORM_CONTROL_ARGS,
  },
  argTypes: {
    color: {
      control: { type: 'select' },
      options: STORY_COLOR_OPTIONS,
    },
  },
};
export default meta;

type Story = StoryObj<SwitchComponent>;

export const Switch: Story = {
  args: {},
};
