import { argsToTemplate, Meta, moduleMetadata, StoryObj } from '@storybook/angular';
import { STORY_SIZE_OPTIONS } from '../../../.storybook/constants';
import { Input as InputComponent } from '../form/input';
import { Select as SelectComponent } from '../form/select';
import { FormControlAddon } from './form-control-addon';
import { FormControlGroup as FormControlGroupComponent } from './form-control-group';

const meta: Meta<FormControlGroupComponent> = {
  component: FormControlGroupComponent,
  subcomponents: { InputComponent, SelectComponent, FormControlAddon },
  title: 'Form/FormControlGroup',
  decorators: [
    moduleMetadata({
      imports: [InputComponent, SelectComponent, FormControlAddon],
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

