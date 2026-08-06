import { argsToTemplate, type Meta, type StoryObj } from '@storybook/angular';
import {
  STORY_COLOR_OPTIONS,
  STORY_FORM_CONTROL_ARGS,
  STORY_SIZE_OPTIONS,
} from '../../../../.storybook/constants';
import { Rating } from './rating';
import { ratingColor } from './rating.types';

const RATING_COLOR_OPTIONS: ratingColor[] = [...STORY_COLOR_OPTIONS, 'golden'];

const meta: Meta<Rating> = {
  component: Rating,
  title: 'Form/Rating',
  args: {
    value: 3,
    max: 5,
    color: 'golden',
    size: 'md',
    allowHalf: false,
    allowClear: true,
    preview: false,
    ...STORY_FORM_CONTROL_ARGS,
  },
  argTypes: {
    color: {
      control: { type: 'select' },
      options: RATING_COLOR_OPTIONS,
    },
    size: {
      control: { type: 'select' },
      options: STORY_SIZE_OPTIONS,
    },
  },
};
export default meta;

type Story = StoryObj<Rating>;

export const RatingStory: Story = {
  name: 'Rating',
  args: {},
};

export const HalfStars: Story = {
  args: {
    allowHalf: true,
    value: 2.5,
  },
};

export const Preview: Story = {
  args: {
    preview: true,
    allowHalf: true,
    value: 2,
  },
};

export const CustomStarTemplate: Story = {
  render: args => ({
    props: args,
    template: `
      <tls-rating ${argsToTemplate(args)}>
        <ng-template #starTemplate let-star let-filled="filled">
          <span>{{ filled ? '❤️' : '🩶' }}</span>
        </ng-template>
      </tls-rating>
    `,
  }),
};
