import type { Meta, StoryObj } from '@storybook/angular';
import { STORY_FORM_CONTROL_ARGS } from '../../../../.storybook/constants/form-control-args';
import { Checkbox as CheckboxComponent } from './checkbox';

const meta: Meta<CheckboxComponent> = {
  component: CheckboxComponent,
  title: 'Form/Checkbox',
  args: {
    checked: false,
    indeterminate: false,
    ...STORY_FORM_CONTROL_ARGS,
  },
  argTypes: {},
};
export default meta;

type Story = StoryObj<CheckboxComponent>;

export const Checkbox: Story = {
  args: {},
};
