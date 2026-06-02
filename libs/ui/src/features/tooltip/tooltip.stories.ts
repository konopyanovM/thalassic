import { moduleMetadata, Meta, StoryObj } from '@storybook/angular';
import { STORY_COLOR_OPTIONS } from '../../../.storybook/constants';
import { Button } from '../button/button';
import { TooltipDirective } from './tooltip.directive';
import { tooltipPosition } from './tooltip.types';

const TOOLTIP_POSITION_OPTIONS: tooltipPosition[] = [
  'top',
  'top-start',
  'top-end',
  'right',
  'right-start',
  'right-end',
  'bottom',
  'bottom-start',
  'bottom-end',
  'left',
  'left-start',
  'left-end',
  'top-left',
  'top-right',
  'bottom-left',
  'bottom-right',
];

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
      options: TOOLTIP_POSITION_OPTIONS,
    },
    tooltipOrigin: {
      control: { type: 'select' },
      options: ['element', 'cursor'],
    },
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
          [tooltipDisabled]="tooltipDisabled"
        >Hover me</tls-button>
      </div>
    `,
  }),
};
export default meta;

type Story = StoryObj<TooltipDirective>;

export const Tooltip: Story = {};