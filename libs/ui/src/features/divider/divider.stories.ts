import { argsToTemplate, Meta, StoryObj } from '@storybook/angular';
import { STORY_ORIENTATION_OPTIONS } from '../../../.storybook/constants';
import { Divider as DividerComponent } from './divider';

const meta: Meta<DividerComponent> = {
  component: DividerComponent,
  title: 'Divider',
  args: {
    orientation: 'horizontal',
    position: 'center',
    variant: 'solid',
    flush: false,
  },
  argTypes: {
    orientation: {
      control: { type: 'select' },
      options: STORY_ORIENTATION_OPTIONS,
    },
    position: {
      control: { type: 'select' },
      options: ['start', 'center', 'end'],
    },
    variant: {
      control: { type: 'select' },
      options: ['dashed', 'dotted', 'solid'],
    },
  },
  render: args => ({
    props: args,
    template: `<tls-divider ${argsToTemplate(args)} ></tls-divider>`,
  }),
};
export default meta;

type Story = StoryObj<DividerComponent>;

export const Horizontal: Story = {
  args: {
    orientation: 'horizontal',
  },
  render: args => ({
    props: args,
    template: `<tls-divider ${argsToTemplate(args)} >This is divider</tls-divider>`,
  }),
};

export const Vertical: Story = {
  args: {
    orientation: 'vertical',
  },
  render: args => ({
    props: args,
    template: `
      <div style="display: flex; gap: 16px;">
      <span>This is</span>
      <tls-divider ${argsToTemplate(args)} />
      <span>vertical divider</span>
      </div>
    `,
  }),
};
