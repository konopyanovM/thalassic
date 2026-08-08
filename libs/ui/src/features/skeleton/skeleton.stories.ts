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
  },
  argTypes: {
    size: { control: { type: 'number' } },
    width: { control: { type: 'number' } },
    height: { control: { type: 'number' } },
    radius: { control: { type: 'text' } },
    duration: { control: { type: 'number' } },
    rounded: { control: { type: 'boolean' } },
    animate: { control: { type: 'boolean' } },
  },
  render: args => ({
    props: args,
    template: `<tls-skeleton ${argsToTemplate(args)} />`,
  }),
};
export default meta;

type Story = StoryObj<SkeletonComponent>;

export const Skeleton: Story = {};
