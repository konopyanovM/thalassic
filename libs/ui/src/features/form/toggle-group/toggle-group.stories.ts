import { argsToTemplate, Meta, StoryObj } from '@storybook/angular';
import {
  STORY_COLOR_OPTIONS,
  STORY_FORM_CONTROL_ARGS,
  STORY_ORIENTATION_OPTIONS,
  STORY_SIZE_OPTIONS,
} from '../../../../.storybook/constants';
import { ToggleGroup } from './toggle-group';

interface StoryOption {
  name: string;
  id: string;
  inactive: boolean;
}

const meta: Meta<ToggleGroup<StoryOption, string>> = {
  component: ToggleGroup,
  title: 'Form/ToggleGroup',
  args: {
    value: ['week'],
    multiple: false,
    size: 'md',
    color: 'primary',
    orientation: 'horizontal',
    ...STORY_FORM_CONTROL_ARGS,
  },
  argTypes: {
    size: {
      control: { type: 'select' },
      options: STORY_SIZE_OPTIONS,
    },
    color: {
      control: { type: 'select' },
      options: STORY_COLOR_OPTIONS,
    },
    orientation: {
      control: { type: 'select' },
      options: STORY_ORIENTATION_OPTIONS,
    },
  },
};
export default meta;

type Story = StoryObj<ToggleGroup<StoryOption, string>>;

export const Single: Story = {
  name: 'Single (plain strings)',
  args: {
    options: ['Day', 'Week', 'Month', 'Year'],
    value: ['Week'],
    multiple: false,
  },
};

export const Multiple: Story = {
  name: 'Multiple (plain strings)',
  args: {
    options: ['Day', 'Week', 'Month', 'Year'],
    value: ['Day', 'Week'],
    multiple: true,
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
    multiple: false,
  },
};

export const CustomTemplate: Story = {
  name: 'Custom option template',
  render: args => ({
    props: {
      ...args,
      options: ['☀️ Day', '📅 Week', '🗓️ Month', '📆 Year'],
      value: ['📅 Week'],
    },
    template: `
      <tls-toggle-group ${argsToTemplate(args)} [options]="options" [value]="value">
        <ng-template #option let-option>
          <strong>{{ option.label }}</strong>
        </ng-template>
      </tls-toggle-group>
    `,
  }),
};
