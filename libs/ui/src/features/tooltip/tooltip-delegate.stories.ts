import { Meta, moduleMetadata, StoryObj } from '@storybook/angular';
import { STORY_COLOR_OPTIONS, STORY_OVERLAY_POSITION_OPTIONS } from '../../../.storybook/constants';
import { TooltipDelegateDirective } from './tooltip-delegate.directive';

const meta: Meta<TooltipDelegateDirective> = {
  title: 'Tooltip delegate',
  decorators: [
    moduleMetadata({
      imports: [TooltipDelegateDirective],
    }),
  ],
  args: {
    tooltipPosition: 'top',
    tooltipColor: 'secondary',
    tooltipOrigin: 'element',
    tooltipArrow: true,
    tooltipDisabled: false,
  },
  argTypes: {
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
    contentAttribute: { table: { disable: true } },
  },
  render: args => ({
    props: { ...args, cells: Array.from({ length: 60 }, (unused, index) => index + 1) },
    template: `
      <p style="margin-bottom: 16px;">
        One directive serves every cell below — hover or tab through them.
      </p>

      <div
        tlsTooltipDelegate
        style="display: grid; grid-template-columns: repeat(20, 32px); gap: 4px;"
        [tooltipPosition]="tooltipPosition"
        [tooltipColor]="tooltipColor"
        [tooltipOrigin]="tooltipOrigin"
        [tooltipArrow]="tooltipArrow"
        [tooltipDisabled]="tooltipDisabled"
      >
        @for (cell of cells; track cell) {
          <button
            type="button"
            style="height: 32px; border: 1px solid currentColor; border-radius: 4px; background: none; color: inherit;"
            [attr.data-tooltip]="'Cell number ' + cell"
          >{{ cell }}</button>
        }
      </div>
    `,
  }),
};
export default meta;

type Story = StoryObj<TooltipDelegateDirective>;

export const Delegate: Story = {};
