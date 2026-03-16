import type { Meta, StoryObj } from '@storybook/angular';
import { Input as InputComponent } from '../form/input';
import { FormField } from './form-field';

const meta: Meta<FormField> = {
  component: FormField,
  subcomponents: { InputComponent },
  title: 'FormField',
};
export default meta;

type Story = StoryObj<FormField>;

export const Input: Story = {
  args: {},
  render: args => ({
    props: args,
    template: `
    <tls-form-field>
      <tls-input />
    </tls-form-field>
    `,
  }),
};
