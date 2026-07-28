import { argsToTemplate, Meta, moduleMetadata, StoryObj } from '@storybook/angular';
import {
  STORY_BADGE_VARIANT_OPTIONS,
  STORY_COLOR_OPTIONS,
  STORY_SIZE_OPTIONS,
} from '../../../.storybook/constants';
import { Button as ButtonComponent } from '../button/button';
import { Badge as BadgeComponent } from './badge';
import { badgePosition } from './badge.types';

const BADGE_POSITION_OPTIONS: badgePosition[] = [
  'top-start',
  'top-end',
  'bottom-start',
  'bottom-end',
];

const meta: Meta<BadgeComponent> = {
  component: BadgeComponent,
  title: 'Badge',
  decorators: [
    moduleMetadata({
      imports: [ButtonComponent],
    }),
  ],
  args: {
    value: 3,
    max: 99,
    color: 'primary',
    variant: 'filled',
    position: 'top-end',
    size: 'md',
    dot: false,
    showZero: false,
    hidden: false,
    inset: false,
  },
  argTypes: {
    color: {
      control: { type: 'select' },
      options: STORY_COLOR_OPTIONS,
    },
    variant: {
      control: { type: 'select' },
      options: STORY_BADGE_VARIANT_OPTIONS,
    },
    position: {
      control: { type: 'select' },
      options: BADGE_POSITION_OPTIONS,
    },
    size: {
      control: { type: 'select' },
      options: STORY_SIZE_OPTIONS,
    },
  },
  render: args => ({
    props: args,
    template: `
      <tls-badge ${argsToTemplate(args)}>
        <tls-button icon variant="outlined" ariaLabel="Notifications">🔔</tls-button>
      </tls-badge>
    `,
  }),
};
export default meta;

type Story = StoryObj<BadgeComponent>;

export const Count: Story = {
  args: {},
};

export const Overflow: Story = {
  args: {
    value: 120,
    max: 99,
  },
};

export const Dot: Story = {
  args: {
    dot: true,
    ariaLabel: 'New notifications',
  },
};

export const Inset: Story = {
  args: {
    inset: true,
  },
};
