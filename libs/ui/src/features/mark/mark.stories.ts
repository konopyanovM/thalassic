import { argsToTemplate, Meta, StoryObj } from '@storybook/angular';
import { STORY_COLOR_OPTIONS } from '../../../.storybook/constants';
import { Mark as MarkDirective } from './mark';

const meta: Meta<MarkDirective> = {
  component: MarkDirective,
  title: 'Mark',
  args: {
    color: 'warning',
  },
  argTypes: {
    color: {
      control: { type: 'select' },
      options: STORY_COLOR_OPTIONS,
    },
  },
  render: args => ({
    props: args,
    template: `<p>The quick brown fox <mark tlsMark ${argsToTemplate(args)}>jumps over</mark> the lazy dog.</p>`,
  }),
};
export default meta;

type Story = StoryObj<MarkDirective>;

export const Default: Story = {};

export const Colors: Story = {
  render: () => ({
    template: `
      <div style="display: flex; flex-direction: column; gap: 8px;">
        <p>A <mark tlsMark color="primary">primary</mark> mark.</p>
        <p>A <mark tlsMark color="secondary">secondary</mark> mark.</p>
        <p>A <mark tlsMark color="tertiary">tertiary</mark> mark.</p>
        <p>A <mark tlsMark color="success">success</mark> mark.</p>
        <p>A <mark tlsMark color="info">info</mark> mark.</p>
        <p>A <mark tlsMark color="warning">warning</mark> mark.</p>
        <p>A <mark tlsMark color="danger">danger</mark> mark.</p>
      </div>
    `,
  }),
};
