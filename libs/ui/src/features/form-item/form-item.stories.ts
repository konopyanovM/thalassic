import { argsToTemplate, Meta, moduleMetadata, StoryObj } from '@storybook/angular';
import { Checkbox as CheckboxComponent } from '../form/checkbox';
import { Input as InputComponent } from '../form/input';
import { Switch as SwitchComponent } from '../form/switch';
import { FormItem } from './form-item';

const meta: Meta<FormItem> = {
  component: FormItem,
  subcomponents: { InputComponent },
  title: 'Form/FormItem',
  decorators: [
    moduleMetadata({
      imports: [InputComponent, SwitchComponent, CheckboxComponent],
    }),
  ],
  args: {
    label: 'Email',
    labelPosition: 'top',
    spread: false,
    reserveErrorSpace: true,
    reserveLabelSpace: false,
    displayErrors: true,
    showRequiredMarker: true,
  },
  argTypes: {
    labelPosition: {
      control: { type: 'inline-radio' },
      options: ['top', 'start', 'end'],
    },
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

export const InlineSwitch: Story = {
  args: {
    label: 'Enable notifications',
    labelPosition: 'end',
  },
  render: renderFormItem({
    control: `<tls-switch [checked]="true" />`,
  }),
};

export const InlineCheckbox: Story = {
  args: {
    label: 'I accept the terms',
    labelPosition: 'end',
  },
  render: renderFormItem({
    control: `<tls-checkbox />`,
  }),
};

export const LabelStart: Story = {
  args: {
    label: 'Dark mode',
    labelPosition: 'start',
  },
  render: renderFormItem({
    control: `<tls-switch />`,
  }),
};

export const Spread: Story = {
  args: {
    label: 'Dark mode',
    labelPosition: 'start',
    spread: true,
  },
  render: renderFormItem({
    control: `<tls-switch />`,
  }),
};

export const CustomLabelTemplate: Story = {
  args: {
    label: 'API key',
  },
  render: args => ({
    props: args,
    template: `
      <tls-form-item ${argsToTemplate(args)}>
        <ng-template #labelTemplate let-label let-required="required" let-optionalText="optionalText">
          <span style="display: flex; align-items: center; gap: 6px;">
            <span style="font-weight: 700;">{{ label }}</span>
            <span style="padding: 1px 6px; border-radius: 6px; background: gold; font-size: 11px; font-weight: 700;">
              BETA
            </span>
            @if (required) {
              <span style="color: tomato;">required</span>
            } @else if (optionalText) {
              <span style="opacity: 0.6;">{{ optionalText }}</span>
            }
          </span>
        </ng-template>
        <tls-input placeholder="sk-…" [required]="true" />
      </tls-form-item>
    `,
  }),
};
