import { DIALOG_DATA, DialogRef } from '@angular/cdk/dialog';
import { Component, inject, input } from '@angular/core';
import { Meta, moduleMetadata, StoryObj } from '@storybook/angular';
import { Button } from '../button';
import { DialogService } from './dialog.service';
import { dialogSize } from './dialog.types';

interface DialogData {
  title: string;
  message: string;
}

@Component({
  selector: 'tls-story-dialog-content',
  template: `
    <div class="tls-dialog__header">
      <span class="tls-dialog__title">{{ data.title }}</span>
    </div>
    <div class="tls-dialog__body">
      <p>{{ data.message }}</p>
    </div>
    <div class="tls-dialog__footer">
      <tls-button variant="outlined" (click)="dialogRef.close(false)">Cancel</tls-button>
      <tls-button (click)="dialogRef.close(true)">Confirm</tls-button>
    </div>
  `,
  imports: [Button],
})
class DialogContentComponent {
  protected readonly dialogRef = inject<DialogRef<boolean>>(DialogRef);
  protected readonly data = inject<DialogData>(DIALOG_DATA);
}

@Component({
  selector: 'tls-story-dialog-trigger',
  template: `<tls-button (click)="openDialog()">Open dialog</tls-button>`,
  imports: [Button],
})
class DialogTriggerComponent {
  private readonly dialogService = inject(DialogService);

  readonly size = input<dialogSize>('md');
  readonly closeable = input(true);
  readonly backdropClose = input(true);

  openDialog(): void {
    this.dialogService.open<boolean, DialogData>(DialogContentComponent, {
      size: this.size(),
      closeable: this.closeable(),
      backdropClose: this.backdropClose(),
      data: { title: 'Confirm action', message: 'Are you sure you want to proceed?' },
    });
  }
}

const meta: Meta<DialogTriggerComponent> = {
  component: DialogTriggerComponent,
  title: 'Dialog',
  decorators: [
    moduleMetadata({
      imports: [DialogContentComponent],
    }),
  ],
  args: {
    size: 'md',
    closeable: true,
    backdropClose: true,
  },
  argTypes: {
    size: {
      control: { type: 'select' },
      options: ['sm', 'md', 'lg', 'xl', 'wide', 'full'] satisfies dialogSize[],
    },
  },
  render: args => ({
    props: args,
    template: `
      <div style="display: flex; justify-content: center; align-items: center; height: 200px;">
        <tls-story-dialog-trigger
          [size]="size"
          [closeable]="closeable"
          [backdropClose]="backdropClose"
        />
      </div>
    `,
  }),
};
export default meta;

type Story = StoryObj<DialogTriggerComponent>;

export const Dialog: Story = {};