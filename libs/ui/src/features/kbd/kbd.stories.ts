import { argsToTemplate, Meta, StoryObj } from '@storybook/angular';
import { STORY_SIZE_OPTIONS } from '../../../.storybook/constants';
import { Kbd as KbdDirective } from './kbd';

const meta: Meta<KbdDirective> = {
  component: KbdDirective,
  title: 'Kbd',
  args: {
    size: 'md',
  },
  argTypes: {
    size: {
      control: { type: 'select' },
      options: STORY_SIZE_OPTIONS,
    },
  },
  render: args => ({
    props: args,
    template: `<kbd tlsKbd ${argsToTemplate(args)}>⌘</kbd>`,
  }),
};
export default meta;

type Story = StoryObj<KbdDirective>;

export const Default: Story = {};

export const Shortcut: Story = {
  render: args => ({
    props: args,
    template: `
      <div style="display: flex; align-items: center; gap: 4px;">
        <kbd tlsKbd ${argsToTemplate(args)}>⌘</kbd>
        <span>+</span>
        <kbd tlsKbd ${argsToTemplate(args)}>Shift</kbd>
        <span>+</span>
        <kbd tlsKbd ${argsToTemplate(args)}>K</kbd>
      </div>
    `,
  }),
};

export const Sizes: Story = {
  render: () => ({
    template: `
      <div style="display: flex; align-items: center; gap: 16px;">
        <kbd tlsKbd size="sm">Esc</kbd>
        <kbd tlsKbd size="md">Esc</kbd>
        <kbd tlsKbd size="lg">Esc</kbd>
      </div>
    `,
  }),
};
