import type { Meta, StoryObj } from '@storybook/angular';
import { STORY_COLOR_OPTIONS } from '../../../../../.storybook/constants';
import { STORY_FORM_CONTROL_ARGS } from '../../../../../.storybook/constants/form-control-args';
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
