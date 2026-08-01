import { argsToTemplate, Meta, moduleMetadata, StoryObj } from '@storybook/angular';
import { Icon } from '../../icon';
import {
  STORY_COLOR_OPTIONS,
  STORY_FORM_CONTROL_ARGS,
  STORY_SIZE_OPTIONS,
  STORY_TOGGLE_BUTTON_VARIANT_OPTIONS,
} from '../../../../.storybook/constants';
import { ToggleButton as ToggleButtonComponent } from './toggle-button';

const meta: Meta<ToggleButtonComponent> = {
  component: ToggleButtonComponent,
  title: 'Form/ToggleButton',
  args: {
    label: 'Bold',
    checked: false,
    icon: false,
    color: 'primary',
    variant: 'outlined',
    size: 'md',
    fluid: false,
    checkedColor: undefined,
    checkedVariant: undefined,
    ...STORY_FORM_CONTROL_ARGS,
  },
  argTypes: {
    color: {
      control: { type: 'select' },
      options: STORY_COLOR_OPTIONS,
    },
    size: {
      control: { type: 'select' },
      options: STORY_SIZE_OPTIONS,
    },
    variant: {
      control: { type: 'select' },
      options: STORY_TOGGLE_BUTTON_VARIANT_OPTIONS,
    },
    checkedColor: {
      control: { type: 'select' },
      options: STORY_COLOR_OPTIONS,
    },
    checkedVariant: {
      control: { type: 'select' },
      options: STORY_TOGGLE_BUTTON_VARIANT_OPTIONS,
    },
  },
};
export default meta;

type Story = StoryObj<ToggleButtonComponent>;

export const ToggleButton: Story = {
  args: {},
};

export const Pressed: Story = {
  args: {
    checked: true,
  },
};

export const CheckedOverrides: Story = {
  name: 'Checked color & variant overrides',
  args: {
    variant: 'text',
    checked: true,
    checkedColor: 'success',
    checkedVariant: 'tonal',
  },
};

export const StateLabels: Story = {
  name: 'Per-state labels',
  args: {
    label: 'Mute',
    checkedLabel: 'Muted',
    checkedColor: 'danger',
  },
};

export const StaticWidth: Story = {
  name: 'Static width across states',
  args: {
    label: 'Follow',
    checkedLabel: 'Following',
    staticWidth: true,
    checkedVariant: 'tonal',
  },
};

export const IconOnly: Story = {
  name: 'Icon only',
  decorators: [moduleMetadata({ imports: [Icon] })],
  args: {
    label: undefined,
    icon: true,
    ariaLabel: 'Toggle check',
  },
  render: args => ({
    props: args,
    template: `
      <tls-toggle-button ${argsToTemplate(args)}>
        <tls-icon name="check" />
      </tls-toggle-button>
    `,
  }),
};
