import { argsToTemplate, Meta, StoryObj } from '@storybook/angular';
import { STORY_FORM_CONTROL_ARGS } from '../../../../.storybook/constants';
import { FileUploader } from './file-uploader';

const meta: Meta<FileUploader> = {
  component: FileUploader,
  title: 'Form/FileUploader',
  args: {
    multiple: false,
    accept: '',
    fluid: false,
    ...STORY_FORM_CONTROL_ARGS,
  },
};
export default meta;

type Story = StoryObj<FileUploader>;

export const FileUploaderStory: Story = {
  name: 'FileUploader',
  args: {},
};

export const MultipleFilesStory: Story = {
  name: 'Multiple Files',
  args: { multiple: true },
};

export const AcceptImagesStory: Story = {
  name: 'Accept Images',
  args: { accept: 'image/*' },
};

export const AcceptRuleArrayStory: Story = {
  name: 'Accept (rule array)',
  args: { accept: ['image/*', '.pdf', 'video/mp4'] },
};

export const CustomDropZoneStory: Story = {
  name: 'Custom drop zone template',
  args: { accept: ['image/*', '.pdf'] },
  render: args => ({
    props: args,
    template: `
      <tls-file-uploader ${argsToTemplate(args)}>
        <ng-template #dropZone let-state let-accept="accept">
          <strong>{{ state === 'invalid' ? '🚫 Wrong file type' : '📁 Tap to upload' }}</strong>
          @if (accept) {
            <small>Accepted: {{ accept }}</small>
          }
        </ng-template>
      </tls-file-uploader>
    `,
  }),
};

export const CustomFileRowStory: Story = {
  name: 'Custom file row template',
  args: { multiple: true },
  render: args => ({
    props: args,
    template: `
      <tls-file-uploader ${argsToTemplate(args)}>
        <ng-template #file let-file let-index="index" let-remove="remove">
          <span>{{ index + 1 }}. {{ file.name }} ({{ file.size }} bytes)</span>
          <button type="button" (click)="remove(index)">Delete</button>
        </ng-template>
      </tls-file-uploader>
    `,
  }),
};
