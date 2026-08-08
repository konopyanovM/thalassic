import type { Meta, StoryObj } from '@storybook/angular';
import { STORY_FORM_CONTROL_ARGS, STORY_SIZE_OPTIONS } from '../../../../.storybook/constants';
import { Autocomplete as AutocompleteComponent } from './autocomplete';

const meta: Meta<AutocompleteComponent<{ label: string; value: string; disabled?: boolean }>> = {
  component: AutocompleteComponent,
  title: 'Form/Autocomplete',
  args: {
    value: null,
    placeholder: 'Search a fruit',
    size: 'md',
    fluid: false,
    clearable: false,
    filterMode: 'contains',
    emptyMessage: 'No results',
    tabindex: 0,
    options: [
      { label: 'Apple', value: 'apple' },
      { label: 'Apricot', value: 'apricot' },
      { label: 'Banana', value: 'banana' },
      { label: 'Blueberry', value: 'blueberry' },
      { label: 'Cherry', value: 'cherry' },
      { label: 'Grapefruit (out of season)', value: 'grapefruit', disabled: true },
      { label: 'Mango', value: 'mango' },
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
    filterMode: {
      control: { type: 'inline-radio' },
      options: ['contains', 'startsWith'],
    },
    inputId: { control: false },
  },
};
export default meta;

type Story = StoryObj<AutocompleteComponent<unknown>>;

export const Autocomplete: Story = {};

export const VirtualScroll: Story = {
  args: {
    virtualScroll: true,
    options: Array.from({ length: 10000 }, (_, index) => ({
      label: `Option ${index + 1}`,
      value: `option${index + 1}`,
    })),
  },
};
