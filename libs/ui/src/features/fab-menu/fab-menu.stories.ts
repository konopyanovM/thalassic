import { argsToTemplate, Meta, StoryObj } from '@storybook/angular';
import { FabMenu as FabMenuComponent } from './fab-menu';

const meta: Meta<FabMenuComponent> = {
  component: FabMenuComponent,
  title: 'Fab Menu',
  args: {
    ariaLabel: 'Add block',
    color: 'primary',
    items: [
      { label: 'Stats overview' },
      { label: 'Upcoming sessions' },
      { label: 'Active programs' },
    ],
  },
  render: args => ({
    props: args,
    template: `
    <div style="height: 320px; display: flex; align-items: flex-end; justify-content: flex-end; padding: 24px;">
      <tls-fab-menu ${argsToTemplate(args)} />
    </div>
    `,
  }),
};
export default meta;

type Story = StoryObj<FabMenuComponent>;

export const FabMenu: Story = {
  args: {},
};
