import type { Meta, StoryObj } from '@storybook/angular';
import { STORY_FORM_CONTROL_ARGS, STORY_SIZE_OPTIONS } from '../../../../.storybook/constants';
import { Textarea as TextareaComponent } from './textarea';
import { textareaResize } from './textarea.config';

const RESIZE_OPTIONS: textareaResize[] = ['none', 'both', 'horizontal', 'vertical'];

const meta: Meta<TextareaComponent> = {
  component: TextareaComponent,
  title: 'Form/Textarea',
  args: {
    value: '',
    placeholder: 'Some text',
    size: 'md',
    fluid: false,
    rows: 3,
    resize: 'vertical',
    autosize: false,
    maxRows: 0,
    ...STORY_FORM_CONTROL_ARGS,
  },
  argTypes: {
    size: {
      control: { type: 'select' },
      options: STORY_SIZE_OPTIONS,
    },
    resize: {
      control: { type: 'select' },
      options: RESIZE_OPTIONS,
    },
  },
};
export default meta;

type Story = StoryObj<TextareaComponent>;

export const Textarea: Story = {};
