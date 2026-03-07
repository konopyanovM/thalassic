import type { Meta, StoryObj } from '@storybook/angular';
import { Switch } from './switch';
import { expect } from 'storybook/test';

const meta: Meta<Switch> = {
  component: Switch,
  title: 'Switch',
};
export default meta;

type Story = StoryObj<Switch>;

export const Primary: Story = {
  args: {},
};

export const Heading: Story = {
  args: {},
  play: async ({ canvas }) => {
    await expect(canvas.getByText(/switch/gi)).toBeTruthy();
  },
};
