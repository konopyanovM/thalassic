import { argsToTemplate, Meta, moduleMetadata, StoryObj } from '@storybook/angular';
import { STORY_SIZE_OPTIONS } from '../../../.storybook/constants';
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
  subcomponents: { InputComponent, SelectComponent, FormControlAddon },
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

