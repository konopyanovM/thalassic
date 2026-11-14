import { argsToTemplate, Meta, StoryObj } from '@storybook/angular';
import { Skeleton as SkeletonComponent } from './skeleton';
import { DEFAULT_SKELETON_CONFIG } from './skeleton.config';

const meta: Meta<SkeletonComponent> = {
  component: SkeletonComponent,
  title: 'Skeleton',
  args: {
    size: DEFAULT_SKELETON_CONFIG.size,
    width: DEFAULT_SKELETON_CONFIG.width,
    height: DEFAULT_SKELETON_CONFIG.height,
    radius: DEFAULT_SKELETON_CONFIG.radius,
    duration: DEFAULT_SKELETON_CONFIG.duration,
    rounded: DEFAULT_SKELETON_CONFIG.rounded,
    animate: DEFAULT_SKELETON_CONFIG.animate,
    text: false,
  },
  argTypes: {
    size: { control: { type: 'number' } },
    width: { control: { type: 'number' } },
    height: { control: { type: 'number' } },
    radius: { control: { type: 'text' } },
    duration: { control: { type: 'number' } },
    rounded: { control: { type: 'boolean' } },
    animate: { control: { type: 'boolean' } },
    text: { control: { type: 'boolean' } },
  },
  render: args => ({
    props: args,
    template: `<tls-skeleton ${argsToTemplate(args)} />`,
  }),
};
export default meta;

type Story = StoryObj<SkeletonComponent>;

export const Skeleton: Story = {};

/**
 * Each line sits in the element that will hold its text, so it takes that
 * element's line height and the bar follows its font size.
 */
export const Text: Story = {
  render: () => ({
    template: `
      <h2><tls-skeleton text width="14ch" /></h2>
      <p>
        <tls-skeleton text />
        <tls-skeleton text />
        <tls-skeleton text width="60%" />
      </p>
      <small><tls-skeleton text width="20ch" /></small>
    `,
  }),
};
