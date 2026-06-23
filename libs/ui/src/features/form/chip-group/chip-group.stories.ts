import { argsToTemplate, Meta, StoryObj } from '@storybook/angular';
import {
  STORY_COLOR_OPTIONS,
  STORY_FORM_CONTROL_ARGS,
  STORY_ORIENTATION_OPTIONS,
  STORY_SIZE_OPTIONS,
} from '../../../../.storybook/constants';
import { chipVariant } from '../../chip';
import { ChipGroup } from './chip-group';
import { chipGroupType } from './chip-group.types';

interface StoryOption {
  name: string;
  id: string;
  inactive: boolean;
}

const STORY_TYPE_OPTIONS: chipGroupType[] = ['single', 'multiple'];
const CHIP_VARIANT_OPTIONS: chipVariant[] = ['filled', 'outlined', 'text'];

const meta: Meta<ChipGroup<StoryOption, string>> = {
  component: ChipGroup,
  title: 'Form/ChipGroup',
  args: {
    value: ['Week'],
    type: 'multiple',
    size: 'md',
    color: 'primary',
    variant: 'outlined',
    orientation: 'horizontal',
    rounded: false,
    fluid: false,
    ...STORY_FORM_CONTROL_ARGS,
  },
  argTypes: {
    type: {
      control: { type: 'select' },
      options: STORY_TYPE_OPTIONS,
    },
    size: {
      control: { type: 'select' },
      options: STORY_SIZE_OPTIONS,
    },
    color: {
      control: { type: 'select' },
      options: STORY_COLOR_OPTIONS,
    },
    checkedColor: {
      control: { type: 'select' },
      options: [undefined, ...STORY_COLOR_OPTIONS],
    },
    variant: {
      control: { type: 'select' },
      options: CHIP_VARIANT_OPTIONS,
    },
    checkedVariant: {
      control: { type: 'select' },
      options: [undefined, ...CHIP_VARIANT_OPTIONS],
    },
    orientation: {
      control: { type: 'select' },
      options: STORY_ORIENTATION_OPTIONS,
    },
  },
};
export default meta;

type Story = StoryObj<ChipGroup<StoryOption, string>>;

export const Multiple: Story = {
  name: 'Multiple (plain strings)',
  args: {
    options: ['Day', 'Week', 'Month', 'Year'],
    value: ['Day', 'Week'],
    type: 'multiple',
  },
};

export const Single: Story = {
  name: 'Single (plain strings)',
  args: {
    options: ['Day', 'Week', 'Month', 'Year'],
    value: ['Week'],
    type: 'single',
  },
};

export const WithObjectOptions: Story = {
  name: 'Object options with key mapping',
  args: {
    options: [
      { name: 'Day', id: 'day', inactive: false },
      { name: 'Week', id: 'week', inactive: false },
      { name: 'Month', id: 'month', inactive: false },
      { name: 'Year', id: 'year', inactive: true },
    ],
    optionLabel: 'name',
    optionValue: 'id',
    optionDisabled: 'inactive',
    value: ['week'],
    type: 'multiple',
  },
};

export const CommonIcon: Story = {
  name: 'Common icon for all chips',
  render: args => ({
    props: {
      ...args,
      options: ['Design', 'Code', 'Test', 'Deploy'],
      value: ['Code'],
    },
    template: `
      <tls-chip-group ${argsToTemplate(args)} [options]="options" [value]="value">
        <span #startIcon style="font-size: 12px">#</span>
      </tls-chip-group>
    `,
  }),
};

export const CustomIconPerChip: Story = {
  name: 'Custom icon per chip and state',
  render: args => ({
    props: {
      ...args,
      options: ['Day', 'Week', 'Month', 'Year'],
      value: ['Week'],
    },
    template: `
      <tls-chip-group ${argsToTemplate(args)} [options]="options" [value]="value">
        <ng-template #startIcon let-context>
          <span style="font-size: 12px">{{ context.selected ? '✓' : '○' }}</span>
        </ng-template>
        <ng-template #label let-context>
          <strong>{{ context.option.label }}</strong>
        </ng-template>
      </tls-chip-group>
    `,
  }),
};

export const DifferentTemplatePerOption: Story = {
  name: 'Different template per option (branching)',
  render: args => ({
    props: {
      ...args,
      options: ['day', 'week', 'month', 'year'],
      value: ['week'],
    },
    template: `
      <tls-chip-group ${argsToTemplate(args)} [options]="options" [value]="value">
        <ng-template #startIcon let-context>
          @switch (context.option.value) {
            @case ('day') { <span>☀️</span> }
            @case ('week') { <span>🗓️</span> }
            @case ('month') { <span>📅</span> }
            @default { <span>📆</span> }
          }
        </ng-template>
        <ng-template #label let-context>
          @switch (context.option.value) {
            @case ('year') { <em>Whole {{ context.option.value }}</em> }
            @default { <strong>{{ context.option.value }}</strong> }
          }
        </ng-template>
      </tls-chip-group>
    `,
  }),
};

