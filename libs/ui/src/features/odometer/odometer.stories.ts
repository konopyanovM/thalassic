import { argsToTemplate, Meta, StoryObj } from '@storybook/angular';
import { Odometer as OdometerComponent } from './odometer';
import { DEFAULT_ODOMETER_CONFIG } from './odometer.config';

const meta: Meta<OdometerComponent> = {
  component: OdometerComponent,
  title: 'Odometer',
  args: {
    value: 2026,
    duration: DEFAULT_ODOMETER_CONFIG.duration,
    minIntegerDigits: DEFAULT_ODOMETER_CONFIG.minIntegerDigits,
    fractionDigits: DEFAULT_ODOMETER_CONFIG.fractionDigits,
    decimalSeparator: DEFAULT_ODOMETER_CONFIG.decimalSeparator,
  },
  argTypes: {
    value: { control: { type: 'number' } },
    duration: { control: { type: 'number', min: 0, step: 50 } },
    minIntegerDigits: { control: { type: 'number', min: 1 } },
    fractionDigits: { control: { type: 'number', min: 0 } },
    decimalSeparator: { control: { type: 'text' } },
  },
  render: args => ({
    props: args,
    template: `<tls-odometer ${argsToTemplate(args)} style="font-size: 48px" />`,
  }),
};
export default meta;

type Story = StoryObj<OdometerComponent>;

// Change the `value` control to watch the digits roll to the new number.
export const Odometer: Story = {};

export const Padded: Story = {
  args: { value: 42, minIntegerDigits: 5 },
};

export const Decimals: Story = {
  args: { value: 1234.5, minIntegerDigits: 1, fractionDigits: 2 },
};

export const Negative: Story = {
  args: { value: -128 },
};
