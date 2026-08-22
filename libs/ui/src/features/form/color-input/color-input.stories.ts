import { Meta, StoryObj } from '@storybook/angular';
import { STORY_FORM_CONTROL_ARGS, STORY_SIZE_OPTIONS } from '../../../../.storybook/constants';
import { ColorInput as ColorInputComponent } from './color-input';

const meta: Meta<ColorInputComponent> = {
  component: ColorInputComponent,
  title: 'Form/Color Input',
  args: {
    value: '#3b82f6',
    alpha: false,
    placeholder: 'Pick a color',
    size: 'md',
    fluid: false,
    ...STORY_FORM_CONTROL_ARGS,
  },
  argTypes: {
    size: {
      control: { type: 'select' },
      options: STORY_SIZE_OPTIONS,
    },
  },
};
export default meta;

type Story = StoryObj<ColorInputComponent>;

export const Basic: Story = {
  args: {},
};

export const WithAlpha: Story = {
  args: {
    alpha: true,
    value: '#8b5cf680',
  },
};

export const Empty: Story = {
  args: {
    value: '',
  },
};

export const PickerOnly: Story = {
  args: {
    pickerOnly: true,
    presets: ['#ef4444', '#f97316', '#eab308', '#22c55e', '#3b82f6', '#8b5cf6'],
  },
};
