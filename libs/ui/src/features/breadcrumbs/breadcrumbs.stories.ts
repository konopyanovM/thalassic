import { provideRouter } from '@angular/router';
import { applicationConfig, argsToTemplate, Meta, StoryObj } from '@storybook/angular';
import { Breadcrumbs as BreadcrumbsComponent } from './breadcrumbs';
import { BreadcrumbItem } from './breadcrumbs.types';

const ICON_HOME = `data:image/svg+xml,${encodeURIComponent(
  '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>',
)}`;

const BASIC_ITEMS: BreadcrumbItem[] = [
  { label: 'Home', link: '/' },
  { label: 'Programs', link: '/programs' },
  { label: 'Strength', link: '/programs/strength' },
  { label: 'Week 3' },
];

const meta: Meta<BreadcrumbsComponent> = {
  component: BreadcrumbsComponent,
  title: 'Breadcrumbs',
  decorators: [
    applicationConfig({
      providers: [provideRouter([])],
    }),
  ],
  args: {
    items: BASIC_ITEMS,
    separatorIcon: 'chevron-right',
  },
  argTypes: {
    separatorIcon: {
      control: { type: 'select' },
      options: ['chevron-right', 'chevrons-right'],
    },
    ariaLabel: { table: { disable: true } },
    ariaLabelledby: { table: { disable: true } },
  },
  render: args => ({
    props: args,
    template: `<tls-breadcrumbs ${argsToTemplate(args)}></tls-breadcrumbs>`,
  }),
};
export default meta;

type Story = StoryObj<BreadcrumbsComponent>;

export const Breadcrumbs: Story = {};

export const WithIcon: Story = {
  args: {
    items: [{ label: 'Home', link: '/', icon: ICON_HOME }, ...BASIC_ITEMS.slice(1)],
  },
};

// A projected `<ng-template>` overrides each item's inner content while the list
// structure, links, separators, and current-page marker stay owned by the kit.
export const CustomItemTemplate: Story = {
  render: args => ({
    props: args,
    template: `
      <tls-breadcrumbs ${argsToTemplate(args)}>
        <ng-template let-item let-last="last">
          <span [style.font-weight]="last ? 700 : 400">{{ item.label }}</span>
        </ng-template>
      </tls-breadcrumbs>
    `,
  }),
};
