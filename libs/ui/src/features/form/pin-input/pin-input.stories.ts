import type { Meta, StoryObj } from '@storybook/angular';
import { STORY_PIN_INPUT_TYPE_OPTIONS } from '../../../../.storybook/constants';
import { STORY_FORM_CONTROL_ARGS } from '../../../../.storybook/constants/form-control-args';
import { PinInput as PinInputComponent } from './pin-input';
import { DEFAULT_PIN_INPUT_CONFIG } from './pin-input.config';

const meta: Meta<PinInputComponent> = {
  component: PinInputComponent,
  title: 'Form/PinInput',
  args: {
    value: '',
    type: DEFAULT_PIN_INPUT_CONFIG.type,
    length: DEFAULT_PIN_INPUT_CONFIG.length,
    placeholder: DEFAULT_PIN_INPUT_CONFIG.placeholder,
    ...STORY_FORM_CONTROL_ARGS,
  },
  argTypes: {
    type: {
      control: { type: 'select' },
      options: STORY_PIN_INPUT_TYPE_OPTIONS,
    },
  },
};
export default meta;

type Story = StoryObj<PinInputComponent>;

export const PinInput: Story = {
  args: {},
};
