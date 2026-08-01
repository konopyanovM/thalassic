import { provideRouter, RouterLink, RouterLinkActive } from '@angular/router';
import {
  applicationConfig,
  argsToTemplate,
  Meta,
  moduleMetadata,
  StoryObj,
} from '@storybook/angular';
import {
  STORY_ORIENTATION_OPTIONS,
  STORY_TABS_VARIANT_OPTIONS,
} from '../../../.storybook/constants';
import { TabLinkDirective } from './tab-link.directive';
import { TabNavDirective } from './tab-nav.directive';

const meta: Meta<TabNavDirective> = {
  component: TabNavDirective,
  subcomponents: { TabLinkDirective },
  decorators: [
    applicationConfig({
      // Catch-all componentless route so the demo links can navigate and
      // `routerLinkActive` can mark the current one.
      providers: [provideRouter([{ path: '**', children: [] }])],
    }),
    moduleMetadata({
      imports: [TabLinkDirective, RouterLink, RouterLinkActive],
    }),
  ],
  title: 'TabNav',
  args: {
    variant: 'flat',
    orientation: 'horizontal',
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
  },
  render: args => ({
    props: args,
    template: `
    <nav tlsTabNav ${argsToTemplate(args)} aria-label="Example sections">
      <a tlsTabLink routerLink="/overview" routerLinkActive>Overview</a>
      <a tlsTabLink routerLink="/reports" routerLinkActive>Reports</a>
      <a tlsTabLink routerLink="/billing" routerLinkActive disabled>Billing</a>
      <a tlsTabLink routerLink="/settings" routerLinkActive>Settings</a>
    </nav>
    `,
  }),
};
export default meta;

type Story = StoryObj<TabNavDirective>;

export const TabNav: Story = {
  args: {},
};
