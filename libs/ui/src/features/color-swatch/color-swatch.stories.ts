import { Meta, StoryObj } from '@storybook/angular';
import { size } from '../../types';
import { ColorSwatch as ColorSwatchComponent } from './color-swatch';

const SWATCH_SIZE_OPTIONS: size[] = ['xs', 'sm', 'md', 'lg', 'xl'];

const meta: Meta<ColorSwatchComponent> = {
  component: ColorSwatchComponent,
  title: 'Color Swatch',
  args: {
    value: '#3b82f6',
    size: 'md',
  },
  argTypes: {
    value: {
      control: { type: 'color' },
    },
    size: {
      control: { type: 'select' },
      options: SWATCH_SIZE_OPTIONS,
    },
  },
};
export default meta;

type Story = StoryObj<ColorSwatchComponent>;

export const Solid: Story = {
  args: {},
};

export const Translucent: Story = {
  args: {
    value: '#3b82f680',
  },
};
