import type { Meta, StoryObj } from '@storybook/angular';
import { STORY_FORM_CONTROL_ARGS, STORY_SIZE_OPTIONS } from '../../../../.storybook/constants';
import { Select as SelectComponent } from './select';

const meta: Meta<SelectComponent<{ label: string; value: string; disabled?: boolean }>> = {
  component: SelectComponent,
  title: 'Form/Select',
  args: {
    value: '',
    placeholder: 'Select an option',
    size: 'md',
    fluid: false,
    clearable: false,
    tabindex: 0,
    options: [
      { label: 'Option 1', value: 'option1' },
      { label: 'Option 2', value: 'option2' },
      { label: 'Option 3', value: 'option3' },
      { label: 'Option 4 (disabled)', value: 'option4', disabled: true },
    ],
    optionLabel: 'label',
    optionValue: 'value',
    optionDisabled: 'disabled',
    ...STORY_FORM_CONTROL_ARGS,
  },
  argTypes: {
    size: {
      control: { type: 'select' },
      options: STORY_SIZE_OPTIONS,
    },
    inputId: { control: false },
  },
};
export default meta;

type Story = StoryObj<SelectComponent<unknown>>;

export const Select: Story = {};
