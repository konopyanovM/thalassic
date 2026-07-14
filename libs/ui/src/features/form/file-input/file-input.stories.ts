import { argsToTemplate, Meta, StoryObj } from '@storybook/angular';
import { STORY_FORM_CONTROL_ARGS, STORY_SIZE_OPTIONS } from '../../../../.storybook/constants';
import { FileInput } from './file-input';

const meta: Meta<FileInput> = {
  component: FileInput,
  title: 'Form/FileInput',
  args: {
    variant: 'dropzone',
    size: 'md',
    multiple: false,
    accept: '',
    fluid: false,
    hideFileList: false,
    ...STORY_FORM_CONTROL_ARGS,
  },
  argTypes: {
    size: {
      control: { type: 'select' },
      options: STORY_SIZE_OPTIONS,
    },
  },
};
export default meta;

type Story = StoryObj<FileInput>;

export const FileInputStory: Story = {
  name: 'FileInput',
  args: {},
};

export const ButtonVariantStory: Story = {
  name: 'Button variant',
  args: { variant: 'button' },
};

export const HiddenFileListStory: Story = {
  name: 'Hidden file list',
  args: { multiple: true, hideFileList: true },
};

export const MultipleFilesStory: Story = {
  name: 'Multiple Files',
  args: { multiple: true },
};

export const AcceptImagesStory: Story = {
  name: 'Accept Images',
  args: { accept: 'image/*' },
};

export const CustomDropZoneStory: Story = {
  name: 'Custom drop zone template',
  args: { accept: ['image/*', '.pdf'] },
  render: args => ({
    props: args,
    template: `
      <tls-file-input ${argsToTemplate(args)}>
        <ng-template #dropZone let-state let-accept="accept">
          <strong>{{ state === 'invalid' ? '🚫 Wrong file type' : '📁 Tap to upload' }}</strong>
          @if (accept) {
            <small>Accepted: {{ accept }}</small>
          }
        </ng-template>
      </tls-file-input>
    `,
  }),
};

export const CustomFileRowStory: Story = {
  name: 'Custom file row template',
  args: { multiple: true },
  render: args => ({
    props: args,
    template: `
      <tls-file-input ${argsToTemplate(args)}>
        <ng-template #file let-file let-index="index" let-remove="remove">
          <span>{{ index + 1 }}. {{ file.name }} ({{ file.size }} bytes)</span>
          <button type="button" (click)="remove(index)">Delete</button>
        </ng-template>
      </tls-file-input>
    `,
  }),
};
