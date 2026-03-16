import { Meta, moduleMetadata, StoryObj } from '@storybook/angular';
import { Input as InputComponent } from '../form/input';
import { FormItem } from './form-item';

const meta: Meta<FormItem> = {
  component: FormItem,
  subcomponents: { InputComponent },
  decorators: [
    moduleMetadata({
      imports: [InputComponent],
    }),
  ],
  title: 'FormItem',
};
export default meta;

type Story = StoryObj<FormItem>;

export const Input: Story = {
  args: {},
  render: args => ({
    props: args,
    template: `
    <tls-form-item>
      <tls-input />
    </tls-form-item>
    `,
  }),
};
