import { argsToTemplate, Meta, moduleMetadata, StoryObj } from '@storybook/angular';
import { STORY_ACCORDION_VARIANT_OPTIONS } from '../../../.storybook/constants';
import { Badge } from '../badge';
import { AccordionItem as AccordionItemComponent } from './accordion-item/accordion-item';
import { Accordion as AccordionComponent } from './accordion';

const meta: Meta<AccordionComponent> = {
  component: AccordionComponent,
  subcomponents: { AccordionItemComponent },
  decorators: [
    moduleMetadata({
      imports: [AccordionItemComponent, Badge],
    }),
  ],
  title: 'Accordion',
  args: {
    variant: 'flat',
    multiExpandable: false,
    headingLevel: 3,
    wrap: false,
    disabled: false,
  },
  argTypes: {
    variant: {
      control: { type: 'select' },
      options: STORY_ACCORDION_VARIANT_OPTIONS,
    },
    headingLevel: {
      control: { type: 'select' },
      options: [2, 3, 4, 5, 6],
    },
  },
  render: args => ({
    props: args,
    template: `
    <tls-accordion ${argsToTemplate(args)}>
      <tls-accordion-item label="Shipping" [expanded]="true">
        Orders leave the warehouse within two business days.
      </tls-accordion-item>
      <tls-accordion-item label="Returns">
        Anything unworn can go back within thirty days.
      </tls-accordion-item>
      <tls-accordion-item label="Wholesale" disabled>
        Currently unavailable.
      </tls-accordion-item>
    </tls-accordion>
    `,
  }),
};
export default meta;

type Story = StoryObj<AccordionComponent>;

export const Accordion: Story = {
  args: {},
};

export const WithDescriptions: Story = {
  args: {},
  render: args => ({
    props: args,
    template: `
    <tls-accordion ${argsToTemplate(args)}>
      <tls-accordion-item label="Shipping" description="Rates and delivery times">
        Orders leave the warehouse within two business days.
      </tls-accordion-item>
      <tls-accordion-item label="Returns" description="Thirty-day window">
        Anything unworn can go back within thirty days.
      </tls-accordion-item>
    </tls-accordion>
    `,
  }),
};

export const CustomHeaderAndTrailingSlots: Story = {
  args: {},
  render: args => ({
    props: args,
    template: `
    <tls-accordion ${argsToTemplate(args)}>
      <tls-accordion-item label="Shipping">
        <ng-template #accordionItemHeader>📦 Shipping</ng-template>
        <ng-template #accordionItemTrailing>
          <tls-badge>3</tls-badge>
        </ng-template>
        Orders leave the warehouse within two business days.
      </tls-accordion-item>
      <tls-accordion-item label="Returns">
        <ng-template #accordionItemTrailing>
          <tls-badge>1</tls-badge>
        </ng-template>
        Anything unworn can go back within thirty days.
      </tls-accordion-item>
    </tls-accordion>
    `,
  }),
};

export const MultiExpandable: Story = {
  args: {
    multiExpandable: true,
  },
};
