import type { Meta, StoryObj } from '@storybook/angular';
import { STORY_FORM_CONTROL_ARGS } from '../../../../.storybook/constants/form-control-args';
import { RadioButton as RadioButtonComponent } from './radio-button';

const meta: Meta<RadioButtonComponent> = {
  component: RadioButtonComponent,
  title: 'Form/RadioButton',
  args: {
    value: '',
    ...STORY_FORM_CONTROL_ARGS,
  },
  argTypes: {},
};
export default meta;

type Story = StoryObj<RadioButtonComponent>;

export const RadioButton: Story = {
  args: {
    radioValue: 'radioValue',
  },
};
