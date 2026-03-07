import type { Meta, StoryObj } from '@storybook/angular';
import { Icon } from './icon';
import { expect } from 'storybook/test';

const meta: Meta<Icon> = {
  component: Icon,
  title: 'Icon',
};
export default meta;

type Story = StoryObj<Icon>;

export const Primary: Story = {
  args: {},
};

export const Heading: Story = {
  args: {},
  play: async ({ canvas }) => {
    await expect(canvas.getByText(/icon/gi)).toBeTruthy();
  },
};
