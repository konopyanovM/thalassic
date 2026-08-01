import type { Meta, StoryObj } from '@storybook/angular';
import { moduleMetadata } from '@storybook/angular';
import { Input } from '../input/input';
import { InputDirective } from '../input/input.directive';
import { MaskDirective } from './mask.directive';

const meta: Meta<MaskDirective> = {
  title: 'Form/Mask',
  decorators: [moduleMetadata({ imports: [MaskDirective, Input, InputDirective] })],
};
export default meta;

type Story = StoryObj<MaskDirective>;

export const Phone: Story = {
  render: () => ({
    template: `
      <tls-input tlsMask="(000) 000-0000" placeholder="(000) 000-0000" #phone="tlsMask" />
      <p>Unmasked: {{ phone.unmasked() }}</p>
    `,
  }),
};

export const NativeInputDate: Story = {
  render: () => ({
    template: `
      <input tlsInput tlsMask="00/00/0000" placeholder="dd/mm/yyyy" #date="tlsMask" />
      <p>Unmasked: {{ date.unmasked() }}</p>
    `,
  }),
};

export const LicensePlate: Story = {
  render: () => ({
    template: `
      <tls-input tlsMask="AAA-000" placeholder="AAA-000" #plate="tlsMask" />
      <p>Unmasked: {{ plate.unmasked() }}</p>
    `,
  }),
};
