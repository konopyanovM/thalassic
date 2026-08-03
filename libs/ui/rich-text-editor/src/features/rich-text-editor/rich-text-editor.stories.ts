import type { Meta, StoryObj } from '@storybook/angular';
import { STORY_FORM_CONTROL_ARGS, STORY_SIZE_OPTIONS } from '../../../../.storybook/constants';
import { RichTextEditor as RichTextEditorComponent } from './rich-text-editor';

const meta: Meta<RichTextEditorComponent> = {
  component: RichTextEditorComponent,
  title: 'Form/Rich Text Editor',
  args: {
    value: '',
    placeholder: 'Write something…',
    size: 'md',
    fluid: false,
    minRows: 4,
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

type Story = StoryObj<RichTextEditorComponent>;

export const RichTextEditor: Story = {
  args: {},
};

export const Prefilled: Story = {
  args: {
    value: [
      '# Release notes',
      '',
      'This build ships **bold**, *italic*, ~~strikethrough~~ and `inline code`.',
      '',
      '- A bulleted item',
      '- Another with a [link](https://example.com)',
      '',
      '> A short blockquote to round things off.',
    ].join('\n'),
  },
};

export const Fluid: Story = {
  args: {
    fluid: true,
    minRows: 6,
  },
};
