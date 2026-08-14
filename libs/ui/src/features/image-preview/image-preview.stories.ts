import { Component, inject, input } from '@angular/core';
import { Meta, moduleMetadata, StoryObj } from '@storybook/angular';
import { Button } from '../button';
import { ImagePreviewService } from './image-preview.service';
import { ImagePreviewDirective } from './image-preview.directive';
import { ImagePreviewGroupDirective } from './image-preview-group.directive';

const PHOTOS = [
  { id: 1015, caption: 'A river running through a canyon' },
  { id: 1016, caption: 'A mountain lake at first light' },
  { id: 1018, caption: 'A glacier above the treeline' },
  { id: 1019, caption: 'Pines climbing a ridge' },
];

const THUMBNAIL_STYLE =
  'width: 160px; height: 120px; object-fit: cover; border-radius: 12px; display: block;';

const GALLERY_STYLE = 'display: flex; flex-wrap: wrap; gap: 16px;';

function thumbnailSource(id: number): string {
  return `https://picsum.photos/id/${id}/320/240`;
}

function fullSource(id: number): string {
  return `https://picsum.photos/id/${id}/1600/1200`;
}

@Component({
  selector: 'tls-story-image-preview-gallery',
  template: `
    <div tlsImagePreviewGroup style="${GALLERY_STYLE}">
      @for (photo of photos; track photo.id) {
        <img
          [tlsImagePreview]="full(photo.id)"
          [tlsImagePreviewCaption]="captions() ? photo.caption : undefined"
          [src]="thumbnail(photo.id)"
          [alt]="photo.caption"
          style="${THUMBNAIL_STYLE}"
        />
      }
    </div>
  `,
  imports: [ImagePreviewDirective, ImagePreviewGroupDirective],
})
class ImagePreviewGalleryComponent {
  readonly captions = input(true);

  protected readonly photos = PHOTOS;

  protected full(id: number): string {
    return fullSource(id);
  }

  protected thumbnail(id: number): string {
    return thumbnailSource(id);
  }
}

@Component({
  selector: 'tls-story-image-preview-single',
  template: `
    <img
      tlsImagePreview
      [src]="source"
      alt="A river running through a canyon"
      style="${THUMBNAIL_STYLE}"
    />
  `,
  imports: [ImagePreviewDirective],
})
class ImagePreviewSingleComponent {
  protected readonly source = fullSource(PHOTOS[0].id);
}

@Component({
  selector: 'tls-story-image-preview-service',
  template: `<tls-button (click)="openPreview()">Open preview</tls-button>`,
  imports: [Button],
})
class ImagePreviewServiceComponent {
  readonly zoomable = input(true);
  readonly loop = input(true);
  readonly showCounter = input(true);
  readonly startIndex = input(0);

  private readonly imagePreview = inject(ImagePreviewService);

  openPreview(): void {
    this.imagePreview.open({
      images: PHOTOS.map(photo => ({
        src: fullSource(photo.id),
        alt: photo.caption,
        caption: photo.caption,
      })),
      startIndex: this.startIndex(),
      zoomable: this.zoomable(),
      loop: this.loop(),
      showCounter: this.showCounter(),
    });
  }
}

const meta: Meta<ImagePreviewGalleryComponent> = {
  component: ImagePreviewGalleryComponent,
  title: 'Image Preview',
  decorators: [
    moduleMetadata({
      imports: [ImagePreviewSingleComponent, ImagePreviewServiceComponent],
    }),
  ],
  args: {
    captions: true,
  },
  render: args => ({
    props: args,
    template: `<tls-story-image-preview-gallery [captions]="captions" />`,
  }),
};
export default meta;

/** Thumbnails grouped into one gallery: opening any of them pages through them all. */
export const Gallery: StoryObj<ImagePreviewGalleryComponent> = {};

/** A lone thumbnail. The bare attribute previews the image the host already shows. */
export const Single: StoryObj = {
  render: () => ({ template: `<tls-story-image-preview-single />` }),
};

/** Opened imperatively, without a trigger element. */
export const FromService: StoryObj = {
  args: {
    zoomable: true,
    loop: true,
    showCounter: true,
    startIndex: 0,
  },
  argTypes: {
    startIndex: {
      control: { type: 'range', min: 0, max: PHOTOS.length - 1, step: 1 },
    },
  },
  render: args => ({
    props: args,
    template: `
      <tls-story-image-preview-service
        [zoomable]="zoomable"
        [loop]="loop"
        [showCounter]="showCounter"
        [startIndex]="startIndex"
      />
    `,
  }),
};
