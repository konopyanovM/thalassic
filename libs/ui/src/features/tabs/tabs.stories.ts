import { argsToTemplate, Meta, moduleMetadata, StoryObj } from '@storybook/angular';
import {
  STORY_ORIENTATION_OPTIONS,
  STORY_TABS_VARIANT_OPTIONS,
} from '../../../.storybook/constants';
import { Tab as TabComponent } from './tab/tab';
import { Tabs as TabsComponent } from './tabs';

const meta: Meta<TabsComponent> = {
  component: TabsComponent,
  subcomponents: { TabComponent },
  decorators: [
    moduleMetadata({
      imports: [TabComponent],
    }),
  ],
  title: 'Tabs',
  args: {
    selected: '1',
    variant: 'flat',
    orientation: 'horizontal',
    headerPosition: 'start',
  },
  argTypes: {
    variant: {
      control: { type: 'select' },
      options: STORY_TABS_VARIANT_OPTIONS,
    },
    orientation: {
      control: { type: 'select' },
      options: STORY_ORIENTATION_OPTIONS,
    },
    headerPosition: {
      control: { type: 'inline-radio' },
      options: ['start', 'end'],
    },
  },
  render: args => ({
    props: args,
    template: `
    <tls-tabs ${argsToTemplate(args)}>
       <tls-tab value="0" label="label1">Content 1</tls-tab>
       <tls-tab value="1" label="label2">Content 2</tls-tab>
       <tls-tab value="2" label="label3" disabled>Content 3</tls-tab>
       <tls-tab value="3" label="label4">Content 4</tls-tab>
    </tls-tabs>
    `,
  }),
};
export default meta;

type Story = StoryObj<TabsComponent>;

export const Tabs: Story = {
  args: {},
};

export const CustomHeaderTemplate: Story = {
  args: {},
  render: args => ({
    props: args,
    template: `
    <tls-tabs ${argsToTemplate(args)}>
       <tls-tab value="0" label="label1">
         <ng-template #tabHeader>🏠 Home</ng-template>
         Content 1
       </tls-tab>
       <tls-tab value="1" label="label2">
         <ng-template #tabHeader>⚙️ Settings</ng-template>
         Content 2
       </tls-tab>
       <tls-tab value="2" label="label3">Content 3</tls-tab>
    </tls-tabs>
    `,
  }),
};
