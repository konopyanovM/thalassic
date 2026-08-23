import { argsToTemplate, Meta, StoryObj } from '@storybook/angular';
import { Carousel as CarouselComponent } from './carousel';
import { CarouselSlide } from './carousel-slide';

const SLIDE_IMAGES = [
  'https://picsum.photos/id/1015/1200/600',
  'https://picsum.photos/id/1016/1200/600',
  'https://picsum.photos/id/1018/1200/600',
  'https://picsum.photos/id/1025/1200/600',
];

const FRAME_STYLE = 'width: 640px; max-width: 100%;';

const IMAGE_STYLE = 'display: block; width: 100%; height: auto; border-radius: 12px;';

const SLIDES_TEMPLATE = SLIDE_IMAGES.map(
  (image, index) => `
    <tls-carousel-slide>
      <img src="${image}" alt="Landscape photo ${index + 1}" style="${IMAGE_STYLE}" />
    </tls-carousel-slide>`,
).join('');

const meta: Meta<CarouselComponent> = {
  component: CarouselComponent,
  title: 'Carousel',
  args: {
    loop: false,
    autoplayInterval: 0,
    showArrows: true,
    showIndicators: true,
  },
  argTypes: {
    autoplayInterval: {
      control: { type: 'number', min: 0, step: 500 },
    },
  },
  render: args => ({
    props: args,
    moduleMetadata: { imports: [CarouselSlide] },
    template: `
      <div style="${FRAME_STYLE}">
        <tls-carousel ${argsToTemplate(args)} ariaLabel="Landscape photos">${SLIDES_TEMPLATE}
        </tls-carousel>
      </div>
    `,
  }),
};
export default meta;

type Story = StoryObj<CarouselComponent>;

export const Default: Story = {};

export const Loop: Story = {
  args: {
    loop: true,
  },
};

export const Autoplay: Story = {
  args: {
    loop: true,
    autoplayInterval: 3000,
  },
};

export const WithoutControls: Story = {
  args: {
    showArrows: false,
    showIndicators: false,
  },
};
