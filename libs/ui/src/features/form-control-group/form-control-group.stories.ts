import { argsToTemplate, Meta, moduleMetadata, StoryObj } from '@storybook/angular';
import {
  STORY_COLOR_OPTIONS,
  STORY_SIZE_OPTIONS,
  STORY_VARIANT_OPTIONS,
} from '../../../.storybook/constants';
import { buttonColor, buttonVariant, Button as ButtonComponent } from '../button';
import { controlSize } from '../../types';
import { Autocomplete as AutocompleteComponent } from '../form/autocomplete';
import { DateTimePicker as DateTimePickerComponent } from '../form/date-time-picker';
import { Input as InputComponent } from '../form/input';
import { InputNumber as InputNumberComponent } from '../form/input-number';
import { MultiSelect as MultiSelectComponent } from '../form/multi-select';
import { Select as SelectComponent } from '../form/select';
import { FormControlAddon } from './form-control-addon';
import { FormControlGroup as FormControlGroupComponent } from './form-control-group';

const meta: Meta<FormControlGroupComponent> = {
  component: FormControlGroupComponent,
  subcomponents: { InputComponent, SelectComponent, FormControlAddon, ButtonComponent },
  title: 'Form/FormControlGroup',
  decorators: [
    moduleMetadata({
      imports: [
        InputComponent,
        InputNumberComponent,
        SelectComponent,
        MultiSelectComponent,
        AutocompleteComponent,
        DateTimePickerComponent,
        FormControlAddon,
        ButtonComponent,
      ],
    }),
  ],
  args: {
    size: 'md',
    fluid: false,
  },
  argTypes: {
    size: {
      control: { type: 'select' },
      options: STORY_SIZE_OPTIONS,
    },
  },
};
export default meta;

type Story = StoryObj<FormControlGroupComponent>;

/**
 * Controls for the button an addon carries, prefixed so they stay distinct from the
 * group's own `size` / `fluid` args in the Storybook panel.
 */
interface ButtonAddonArgs {
  addonDivider: boolean;
  buttonLabel: string;
  buttonColor: buttonColor;
  buttonVariant: buttonVariant;
  buttonSize: controlSize;
  buttonIcon: boolean;
  buttonRounded: boolean;
  buttonDisabled: boolean;
}

type ButtonAddonStory = StoryObj<FormControlGroupComponent & ButtonAddonArgs>;

export const WithAddon: Story = {
  args: {},
  render: args => ({
    props: args,
    template: `
      <tls-form-control-group ${argsToTemplate(args)}>
        <tls-form-control-addon>$</tls-form-control-addon>
        <tls-input placeholder="0.00" />
        <tls-form-control-addon>USD</tls-form-control-addon>
      </tls-form-control-group>
    `,
  }),
};

export const Fluid: Story = {
  args: {
    fluid: true,
  },
  render: args => ({
    props: args,
    template: `
      <div style="width: 320px;">
        <tls-form-control-group ${argsToTemplate(args)}>
          <tls-input placeholder="Full width" />
        </tls-form-control-group>
      </div>
    `,
  }),
};

export const WithSelect: Story = {
  args: {},
  render: args => ({
    props: {
      ...args,
      options: ['+1', '+44', '+90'],
    },
    template: `
      <tls-form-control-group ${argsToTemplate(args)}>
        <tls-select [options]="options" placeholder="+1" />
        <tls-input placeholder="Phone number" />
      </tls-form-control-group>
    `,
  }),
};

const SEARCH_ICON = `
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
    <circle cx="11" cy="11" r="8" />
    <line x1="21" y1="21" x2="16.65" y2="16.65" />
  </svg>
`;

const CALENDAR_ICON = `
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
    <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
    <line x1="16" y1="2" x2="16" y2="6" />
    <line x1="8" y1="2" x2="8" y2="6" />
    <line x1="3" y1="10" x2="21" y2="10" />
  </svg>
`;

const PHONE_ICON = `
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
    <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6A19.79 19.79 0 0 1 2.09 4.18 2 2 0 0 1 4.08 2h3a2 2 0 0 1 2 1.72c.13.96.36 1.9.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.9.34 1.85.57 2.81.7A2 2 0 0 1 22 16.92Z" />
  </svg>
`;

const SEND_ICON = `
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
    <path d="M22 2 11 13" />
    <path d="M22 2 15 22l-4-9-9-4Z" />
  </svg>
`;

const CLOSE_ICON = `
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
    <line x1="18" y1="6" x2="6" y2="18" />
    <line x1="6" y1="6" x2="18" y2="18" />
  </svg>
`;

const TAG_ICON = `
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
    <path d="M20.59 13.41 13.42 20.58a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82Z" />
    <line x1="7" y1="7" x2="7.01" y2="7" />
  </svg>
`;

// A leading icon on any control is composed as a projected addon inside the group —
// no per-component icon slot is needed. The group flattens each control's own
// border/padding so the icon and control read as one field.
export const LeadingIcon: Story = {
  args: {},
  render: args => ({
    props: args,
    template: `
      <tls-form-control-group ${argsToTemplate(args)}>
        <tls-form-control-addon aria-hidden="true">${SEARCH_ICON}</tls-form-control-addon>
        <tls-input placeholder="Search" />
      </tls-form-control-group>
    `,
  }),
};

export const NumberWithAddon: Story = {
  args: {},
  render: args => ({
    props: args,
    template: `
      <tls-form-control-group ${argsToTemplate(args)}>
        <tls-form-control-addon>$</tls-form-control-addon>
        <tls-input-number placeholder="0" />
      </tls-form-control-group>
    `,
  }),
};

export const MultiSelectWithIcon: Story = {
  args: {},
  render: args => ({
    props: {
      ...args,
      options: ['React', 'Angular', 'Vue', 'Svelte'],
    },
    template: `
      <tls-form-control-group ${argsToTemplate(args)}>
        <tls-form-control-addon aria-hidden="true">${TAG_ICON}</tls-form-control-addon>
        <tls-multi-select [options]="options" placeholder="Frameworks" />
      </tls-form-control-group>
    `,
  }),
};

export const AutocompleteWithIcon: Story = {
  args: {},
  render: args => ({
    props: {
      ...args,
      options: ['Apple', 'Banana', 'Cherry', 'Grape'],
    },
    template: `
      <tls-form-control-group ${argsToTemplate(args)}>
        <tls-form-control-addon aria-hidden="true">${SEARCH_ICON}</tls-form-control-addon>
        <tls-autocomplete [options]="options" placeholder="Search fruit" />
      </tls-form-control-group>
    `,
  }),
};

// A button projected into an addon becomes a segment of the field: the group takes
// over its size scale and the button spans the field's full height, meeting its
// border and rounding with it. `buttonSize` and `buttonRounded` are exposed to show
// that they have no effect here: the group resolves the size for every control it
// holds, and the field owns the corners of anything that reaches its edge.
export const WithButton: ButtonAddonStory = {
  args: {
    addonDivider: false,
    buttonLabel: 'Send',
    buttonColor: 'primary',
    buttonVariant: 'filled',
    buttonSize: 'md',
    buttonIcon: false,
    buttonRounded: false,
    buttonDisabled: false,
  },
  argTypes: {
    buttonColor: {
      control: { type: 'select' },
      options: STORY_COLOR_OPTIONS,
    },
    buttonVariant: {
      control: { type: 'select' },
      options: STORY_VARIANT_OPTIONS,
    },
    buttonSize: {
      control: { type: 'select' },
      options: STORY_SIZE_OPTIONS,
    },
  },
  render: args => ({
    props: args,
    template: `
      <tls-form-control-group [size]="size" [fluid]="fluid">
        <tls-input placeholder="Message" />
        <tls-form-control-addon [divider]="addonDivider">
          <tls-button
            [label]="buttonLabel"
            [color]="buttonColor"
            [variant]="buttonVariant"
            [size]="buttonSize"
            [icon]="buttonIcon"
            [rounded]="buttonRounded"
            [disabled]="buttonDisabled"
            ariaLabel="Send message"
          >${SEND_ICON}</tls-button>
        </tls-form-control-addon>
      </tls-form-control-group>
    `,
  }),
};

// `divider` rules an addon off from whatever sits beside it, for when the addon is a
// region of its own — an action, a unit selector — rather than a hint attached to the
// value. The rule lands on each edge that faces a sibling: the two addons here are at
// either end, so each is ruled only on its inner side; one placed between two controls
// would be ruled on both.
export const WithDividers: Story = {
  args: {},
  render: args => ({
    props: args,
    template: `
      <tls-form-control-group ${argsToTemplate(args)}>
        <tls-form-control-addon divider>$</tls-form-control-addon>
        <tls-input placeholder="0.00" />
        <tls-form-control-addon divider>USD</tls-form-control-addon>
      </tls-form-control-group>
    `,
  }),
};

// A field can hold more than one control. Clicking an addon reaches the control nearest
// it — the leading icon focuses the country select, the trailing `ext.` the number —
// rather than whichever control happens to come first in the row.
export const TwoControls: Story = {
  args: {},
  render: args => ({
    props: {
      ...args,
      options: ['+1', '+44', '+90'],
    },
    template: `
      <tls-form-control-group ${argsToTemplate(args)}>
        <tls-form-control-addon aria-hidden="true">${PHONE_ICON}</tls-form-control-addon>
        <tls-select [options]="options" placeholder="+1" />
        <tls-input placeholder="Phone number" />
        <tls-form-control-addon divider>ext.</tls-form-control-addon>
      </tls-form-control-group>
    `,
  }),
};

// An addon takes the control nearest it, which leaves an addon between two controls
// ambiguous. Name the control with a template reference to settle it — here the middle
// addon hands over to the amount rather than to the currency beside it.
export const NamedControl: Story = {
  args: {},
  render: args => ({
    props: {
      ...args,
      currencies: ['USD', 'EUR', 'GBP'],
    },
    template: `
      <tls-form-control-group ${argsToTemplate(args)}>
        <tls-select [options]="currencies" placeholder="USD" />
        <tls-form-control-addon divider [control]="amount">$</tls-form-control-addon>
        <tls-input #amount placeholder="0.00" />
      </tls-form-control-group>
    `,
  }),
};

export const WithIconButton: Story = {
  args: {},
  render: args => ({
    props: args,
    template: `
      <tls-form-control-group ${argsToTemplate(args)}>
        <tls-form-control-addon aria-hidden="true">${SEARCH_ICON}</tls-form-control-addon>
        <tls-input placeholder="Search" />
        <tls-form-control-addon>
          <tls-button icon variant="text" ariaLabel="Clear search">${CLOSE_ICON}</tls-button>
        </tls-form-control-addon>
      </tls-form-control-group>
    `,
  }),
};

export const DateTimePickerWithIcon: Story = {
  args: {},
  render: args => ({
    props: args,
    template: `
      <tls-form-control-group ${argsToTemplate(args)}>
        <tls-form-control-addon aria-hidden="true">${CALENDAR_ICON}</tls-form-control-addon>
        <tls-date-time-picker placeholder="Pick a date" />
      </tls-form-control-group>
    `,
  }),
};

