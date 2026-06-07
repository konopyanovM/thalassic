import type { Meta, StoryObj } from '@storybook/angular';
import { STORY_FORM_CONTROL_ARGS } from '../../../../.storybook/constants';
import { DateTimePicker as DateTimePickerComponent } from './date-time-picker';
import { DEFAULT_DATE_TIME_PICKER_CONFIG } from './date-time-picker.config';

const meta: Meta<DateTimePickerComponent> = {
  component: DateTimePickerComponent,
  title: 'Form/DateTimePicker',
  args: {
    value: null,
    mode: DEFAULT_DATE_TIME_PICKER_CONFIG.mode,
    inline: DEFAULT_DATE_TIME_PICKER_CONFIG.inline,
    weekStartsOn: DEFAULT_DATE_TIME_PICKER_CONFIG.weekStartsOn,
    size: DEFAULT_DATE_TIME_PICKER_CONFIG.size,
    ...STORY_FORM_CONTROL_ARGS,
  },
  argTypes: {
    mode: {
      control: { type: 'select' },
      options: ['calendar', 'month-picker', 'year-picker', 'time-picker', 'date-time'],
    },
    size: {
      control: { type: 'select' },
      options: ['sm', 'md', 'lg'],
    },
    weekStartsOn: {
      control: { type: 'select' },
      options: [0, 1, 2, 3, 4, 5, 6],
    },
    value: { control: false },
    weekDays: { control: false },
  },
};
export default meta;

type Story = StoryObj<DateTimePickerComponent>;

export const DateTimePicker: Story = {};
