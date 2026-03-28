import type { Meta, StoryObj } from '@storybook/angular';
import { Icon as IconComponent } from './icon';

const meta: Meta<IconComponent> = {
  component: IconComponent,
  title: 'Icon',
};
export default meta;

type Story = StoryObj<IconComponent>;

export const Icon: Story = {
  args: {},
};
