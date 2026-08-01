import { argsToTemplate, Meta, StoryObj } from '@storybook/angular';
import { STORY_COLOR_OPTIONS } from '../../../.storybook/constants';
import { Highlight as HighlightComponent } from './highlight';

const meta: Meta<HighlightComponent> = {
  component: HighlightComponent,
  title: 'Highlight',
  args: {
    text: 'The quick brown fox jumps over the lazy dog.',
    query: 'quick',
    color: 'warning',
    caseSensitive: false,
  },
  argTypes: {
    color: {
      control: { type: 'select' },
      options: STORY_COLOR_OPTIONS,
    },
  },
  render: args => ({
    props: args,
    template: `<tls-highlight ${argsToTemplate(args)}></tls-highlight>`,
  }),
};
export default meta;

type Story = StoryObj<HighlightComponent>;

export const Default: Story = {};

export const MultipleTerms: Story = {
  args: {
    query: ['quick', 'lazy'],
  },
};

export const CaseSensitive: Story = {
  args: {
    text: 'Fox and fox are different when case matters.',
    query: 'Fox',
    caseSensitive: true,
  },
};
