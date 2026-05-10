import { argsToTemplate, Meta, StoryObj } from '@storybook/angular';
import { Loader as LoaderComponent } from './loader';
import { loaderSize } from './loader.types';

const STORY_LOADER_SIZE_OPTIONS: loaderSize[] = ['xs', 'sm', 'md', 'lg', 'xl'];

const meta: Meta<LoaderComponent> = {
  component: LoaderComponent,
  title: 'Loader',
  args: {
    size: 'md',
    width: null,
    widthRatio: 5,
    ariaLabel: 'Loading',
  },
  argTypes: {
    size: {
      control: { type: 'select' },
      options: STORY_LOADER_SIZE_OPTIONS,
    },
    width: {
      control: { type: 'number' },
    },
    widthRatio: {
      control: { type: 'number' },
    },
  },
  render: args => ({
    props: args,
    template: `<tls-loader ${argsToTemplate(args)} />`,
  }),
};
export default meta;

type Story = StoryObj<LoaderComponent>;

export const Loader: Story = {};
