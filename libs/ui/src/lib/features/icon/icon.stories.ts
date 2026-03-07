import type { Meta, StoryObj } from '@storybook/angular';
import { Icon } from './icon';

const meta: Meta<Icon> = {
  component: Icon,
  title: 'Icon',
};
export default meta;

type Story = StoryObj<Icon>;

export const Base: Story = {
  args: {},
};
