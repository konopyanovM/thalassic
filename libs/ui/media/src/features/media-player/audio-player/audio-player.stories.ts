import { type Meta, type StoryObj } from '@storybook/angular';
import { AudioPlayer } from './audio-player';

const BUNNY_TRACK_SOURCE = 'https://media.w3.org/2010/07/bunny/04-Death_Becomes_Fur.mp3';

const meta: Meta<AudioPlayer> = {
  component: AudioPlayer,
  title: 'Media/Audio Player',
  args: {
    source: BUNNY_TRACK_SOURCE,
    title: undefined,
    autoplay: false,
    loop: false,
    preload: 'metadata',
    ariaLabel: 'Death Becomes Fur',
  },
  argTypes: {
    preload: {
      control: { type: 'select' },
      options: ['none', 'metadata', 'auto'],
    },
  },
};
export default meta;

type Story = StoryObj<AudioPlayer>;

export const Default: Story = {
  args: {},
};

export const WithTitle: Story = {
  args: {
    title: 'Death Becomes Fur',
  },
};
