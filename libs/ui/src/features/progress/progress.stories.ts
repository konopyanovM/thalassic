import { type Meta, type StoryObj } from '@storybook/angular';
import { STORY_COLOR_OPTIONS, STORY_SIZE_OPTIONS } from '../../../.storybook/constants';
import { Progress } from './progress';

const meta: Meta<Progress> = {
  component: Progress,
  title: 'Progress',
  args: {
    value: 40,
    max: 100,
    segments: null,
    activeSegment: null,
    activeSegmentScale: 2,
    color: 'primary',
    size: 'md',
    ariaLabel: 'Completion',
  },
  argTypes: {
    color: {
      control: { type: 'select' },
      options: STORY_COLOR_OPTIONS,
    },
    size: {
      control: { type: 'select' },
      options: STORY_SIZE_OPTIONS,
    },
  },
};
export default meta;

type Story = StoryObj<Progress>;

export const ProgressStory: Story = {
  name: 'Progress',
  args: {},
};

export const Segmented: Story = {
  args: {
    value: 2,
    max: 6,
    segments: 6,
  },
};

export const SegmentedPartial: Story = {
  args: {
    value: 45,
    max: 100,
    segments: 5,
  },
};

export const ActiveSegment: Story = {
  args: {
    value: 2,
    max: 6,
    segments: 6,
    activeSegment: 'latest',
  },
};
