import type { Meta, StoryObj } from '@storybook/angular';
import { STORY_FORM_CONTROL_ARGS, STORY_SIZE_OPTIONS } from '../../../../.storybook/constants';
import { MultiSelect as MultiSelectComponent } from './multi-select';

const meta: Meta<MultiSelectComponent<{ label: string; value: string; disabled?: boolean }>> = {
  component: MultiSelectComponent,
  title: 'Form/MultiSelect',
  args: {
    value: [],
    placeholder: 'Select options',
    size: 'md',
    fluid: false,
    clearable: false,
    tabindex: 0,
    maxLabels: 2,
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

type Story = StoryObj<MultiSelectComponent<unknown>>;

export const MultiSelect: Story = {};
