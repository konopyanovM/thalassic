import { argsToTemplate, Meta, moduleMetadata, StoryObj } from '@storybook/angular';
import { Input as InputComponent } from '../form/input';
import { FormItem } from './form-item';

const meta: Meta<FormItem> = {
  component: FormItem,
  subcomponents: { InputComponent },
  title: 'Form/FormItem',
  decorators: [
    moduleMetadata({
      imports: [InputComponent],
    }),
  ],
  args: {
    label: 'Email',
    reserveErrorSpace: true,
    displayErrors: true,
  },
};
export default meta;

type Story = StoryObj<FormItem>;

type renderConfig = {
  control: string;
  props?: Record<string, unknown>;
};

const renderFormItem =
  ({ control, props }: renderConfig): NonNullable<Story['render']> =>
  args => ({
    props: { ...args, ...props },
    template: `
      <tls-form-item ${argsToTemplate(args)}>
        ${control}
      </tls-form-item>
    `,
  });

export const Default: Story = {
  render: renderFormItem({
    control: `<tls-input placeholder="you@example.com" />`,
  }),
};

export const Fluid: Story = {
  render: renderFormItem({
    control: `<tls-input placeholder="you@example.com" fluid />`,
  }),
};

export const Required: Story = {
  render: renderFormItem({
    control: `<tls-input placeholder="you@example.com" [required]="true" />`,
  }),
};

export const Invalid: Story = {
  render: renderFormItem({
    control: `
      <tls-input
        value="not-an-email"
        placeholder="you@example.com"
        [required]="true"
        [invalid]="true"
        [touched]="true"
        [errors]="errors"
      />
    `,
    props: { errors: [{ kind: 'email' }] },
  }),
};

export const CustomErrorMessage: Story = {
  render: renderFormItem({
    control: `
      <tls-input
        value="taken@example.com"
        placeholder="you@example.com"
        [invalid]="true"
        [touched]="true"
        [errors]="errors"
      />
    `,
    props: { errors: [{ kind: 'unique', message: 'This email is already taken' }] },
  }),
};

export const OptionalMarker: Story = {
  args: {
    showRequiredMarker: false,
    optionalText: '(optional)',
  },
  render: renderFormItem({
    control: `<tls-input placeholder="you@example.com" />`,
  }),
};

export const WithoutLabel: Story = {
  args: {
    label: undefined,
  },
  render: renderFormItem({
    control: `<tls-input placeholder="you@example.com" />`,
  }),
};

export const WithoutReservedErrorSpace: Story = {
  args: {
    reserveErrorSpace: false,
  },
  render: renderFormItem({
    control: `<tls-input placeholder="you@example.com" />`,
  }),
};
