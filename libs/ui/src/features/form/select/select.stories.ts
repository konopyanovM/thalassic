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

export const VirtualScroll: Story = {
  args: {
    virtualScroll: true,
    options: Array.from({ length: 10000 }, (_, index) => ({
      label: `Option ${index + 1}`,
      value: `option${index + 1}`,
    })),
  },
};

export const VirtualScrollCustomOptionTemplate: Story = {
  render: () => ({
    props: {
      options: Array.from({ length: 10000 }, (_, index) => ({
        label: `Option ${index + 1}`,
        value: `option${index + 1}`,
      })),
    },
    template: `
      <tls-select
        [options]="options"
        optionLabel="label"
        optionValue="value"
        virtualScroll="true"
        placeholder="Select an option"
      >
        <ng-template #option let-context>
          <span style="display: inline-flex; align-items: center; gap: 8px;">
            <span style="width: 8px; height: 8px; border-radius: 50%; background: var(--color-primary);"></span>
            {{ context.label }}
          </span>
        </ng-template>
      </tls-select>
    `,
  }),
};

export const CustomOptionTemplate: Story = {
  render: args => ({
    props: args,
    template: `
      <tls-select
        [options]="options"
        optionLabel="label"
        optionValue="value"
        optionDisabled="disabled"
        placeholder="Select an option"
      >
        <ng-template #option let-context>
          <span style="display: inline-flex; align-items: center; gap: 8px;">
            <span style="width: 8px; height: 8px; border-radius: 50%; background: var(--color-primary);"></span>
            {{ context.label }}
            @if (context.selected) {
              <em>(selected)</em>
            }
          </span>
        </ng-template>
      </tls-select>
    `,
  }),
};
