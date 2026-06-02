import { Meta, moduleMetadata, StoryObj } from '@storybook/angular';
import { STORY_OVERLAY_POSITION_OPTIONS } from '../../../.storybook/constants';
import { Button } from '../button';
import { Popover as PopoverComponent } from './popover';

const meta: Meta<PopoverComponent> = {
  component: PopoverComponent,
  title: 'Popover',
  decorators: [
    moduleMetadata({
      imports: [Button],
    }),
  ],
  args: {
    position: 'bottom',
  },
  argTypes: {
    position: {
      control: { type: 'select' },
      options: STORY_OVERLAY_POSITION_OPTIONS,
    },
    offset: { table: { disable: true } },
  },
  render: args => ({
    props: args,
    template: `
      <div style="display: flex; justify-content: center; align-items: center; height: 200px;">
        <tls-button (click)="popover.toggle($event)">Toggle popover</tls-button>
        <tls-popover #popover [position]="position">
          <div>Popover content</div>
        </tls-popover>
      </div>
    `,
  }),
};
export default meta;

type Story = StoryObj<PopoverComponent>;

export const Popover: Story = {};
