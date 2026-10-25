import { argsToTemplate, Meta, StoryObj } from '@storybook/angular';
import { STORY_ODOMETER_DIRECTION_OPTIONS } from '../../../.storybook/constants';
import { Odometer as OdometerComponent } from './odometer';
import { DEFAULT_ODOMETER_CONFIG } from './odometer.config';

const meta: Meta<OdometerComponent> = {
  component: OdometerComponent,
  title: 'Odometer',
  args: {
    value: 2026,
    duration: DEFAULT_ODOMETER_CONFIG.duration,
    delay: DEFAULT_ODOMETER_CONFIG.delay,
    minIntegerDigits: DEFAULT_ODOMETER_CONFIG.minIntegerDigits,
    fractionDigits: DEFAULT_ODOMETER_CONFIG.fractionDigits,
    decimalSeparator: DEFAULT_ODOMETER_CONFIG.decimalSeparator,
    animated: true,
    rollIn: false,
    revolutions: DEFAULT_ODOMETER_CONFIG.revolutions,
    direction: DEFAULT_ODOMETER_CONFIG.direction,
    stagger: DEFAULT_ODOMETER_CONFIG.stagger,
  },
  argTypes: {
    value: { control: { type: 'number' } },
    duration: { control: { type: 'number', min: 0, step: 50 } },
    delay: { control: { type: 'number', min: 0, step: 50 } },
    minIntegerDigits: { control: { type: 'number', min: 1 } },
    fractionDigits: { control: { type: 'number', min: 0 } },
    decimalSeparator: { control: { type: 'text' } },
    text: { control: { type: 'text' } },
    animated: { control: { type: 'boolean' } },
    rollIn: { control: { type: 'boolean' } },
    revolutions: { control: { type: 'number', min: 0 } },
    direction: { control: { type: 'select' }, options: STORY_ODOMETER_DIRECTION_OPTIONS },
    stagger: { control: { type: 'number', min: 0, step: 50 } },
  },
  render: args => ({
    props: args,
    template: `<tls-odometer ${argsToTemplate(args)} style="font-size: 48px" />`,
  }),
};
export default meta;

type Story = StoryObj<OdometerComponent>;

/** Change the `value` control to watch the digits roll to the new number. */
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

/** Text written out by the caller: the digits roll, the colon stays put. */
export const Text: Story = {
  args: { text: '2:59' },
};

/**
 * Slot-machine reels: every column spins in from zero with two extra turns and
 * comes to rest in turn. Remount the story to replay the spin.
 */
export const Spin: Story = {
  args: {
    value: null,
    text: '404',
    rollIn: true,
    revolutions: 2,
    direction: 'down',
    duration: 1100,
    stagger: 450,
  },
};
