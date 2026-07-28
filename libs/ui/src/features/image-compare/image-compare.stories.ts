import { argsToTemplate, Meta, StoryObj } from '@storybook/angular';
import { STORY_ORIENTATION_OPTIONS } from '../../../.storybook/constants';
import { ImageCompare as ImageCompareComponent } from './image-compare';

// Same photo in colour and grayscale, so the wipe reveals a clear difference.
const AFTER_IMAGE = 'https://picsum.photos/id/1015/1200/800';
const BEFORE_IMAGE = 'https://picsum.photos/id/1015/1200/800?grayscale';

const FRAME_STYLE =
  'width: 640px; max-width: 100%; border: 1px solid var(--color-outline-variant); border-radius: 12px; overflow: hidden;';

const meta: Meta<ImageCompareComponent> = {
  component: ImageCompareComponent,
  title: 'Image Compare',
  args: {
    orientation: 'horizontal',
    position: 50,
    keyboardStep: 5,
  },
  argTypes: {
    orientation: {
      control: { type: 'select' },
      options: STORY_ORIENTATION_OPTIONS,
    },
    position: {
      control: { type: 'range', min: 0, max: 100, step: 1 },
    },
  },
  render: args => ({
    props: args,
    template: `
      <div style="${FRAME_STYLE}">
        <tls-image-compare ${argsToTemplate(args)} ariaLabel="Reveal the edited photo">
          <img before src="${BEFORE_IMAGE}" alt="Original photo" />
          <img after src="${AFTER_IMAGE}" alt="Edited photo" />
        </tls-image-compare>
      </div>
    `,
  }),
};
export default meta;

type Story = StoryObj<ImageCompareComponent>;

export const Horizontal: Story = {
  args: {
    orientation: 'horizontal',
  },
};

export const Vertical: Story = {
  args: {
    orientation: 'vertical',
  },
};

export const InitialPosition: Story = {
  args: {
    position: 25,
  },
};
