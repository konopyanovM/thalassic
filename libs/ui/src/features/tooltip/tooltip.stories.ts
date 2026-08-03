import { Meta, moduleMetadata, StoryObj } from '@storybook/angular';
import { STORY_COLOR_OPTIONS, STORY_OVERLAY_POSITION_OPTIONS } from '../../../.storybook/constants';
import { Button } from '../button';
import { TooltipDirective } from './tooltip.directive';

const meta: Meta<TooltipDirective> = {
  title: 'Tooltip',
  decorators: [
    moduleMetadata({
      imports: [TooltipDirective, Button],
    }),
  ],
  args: {
    content: 'Tooltip text',
    tooltipPosition: 'top',
    tooltipColor: 'secondary',
    tooltipOrigin: 'element',
    tooltipArrow: true,
    tooltipDisabled: false,
  },
  argTypes: {
    content: { control: { type: 'text' } },
    tooltipColor: {
      control: { type: 'select' },
      options: STORY_COLOR_OPTIONS,
    },
    tooltipPosition: {
      control: { type: 'select' },
      options: STORY_OVERLAY_POSITION_OPTIONS,
    },
    tooltipOrigin: {
      control: { type: 'select' },
      options: ['element', 'cursor'],
    },
    tooltipArrow: { control: { type: 'boolean' } },
    tooltipDisabled: { control: { type: 'boolean' } },
    tooltipPositions: { table: { disable: true } },
    tooltipOffset: { table: { disable: true } },
    data: { table: { disable: true } },
  },
  render: args => ({
    props: args,
    template: `
      <div style="display: flex; justify-content: center; align-items: center; height: 200px;">
        <tls-button
          [tlsTooltip]="content"
          [tooltipPosition]="tooltipPosition"
          [tooltipColor]="tooltipColor"
          [tooltipOrigin]="tooltipOrigin"
          [tooltipArrow]="tooltipArrow"
          [tooltipDisabled]="tooltipDisabled"
        >Hover me</tls-button>
      </div>
    `,
  }),
};
export default meta;

type Story = StoryObj<TooltipDirective>;

export const Tooltip: Story = {};
