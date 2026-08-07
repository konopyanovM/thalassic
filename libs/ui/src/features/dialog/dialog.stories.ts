import { DIALOG_DATA } from '@angular/cdk/dialog';
import { Component, inject, input } from '@angular/core';
import { Meta, moduleMetadata, StoryObj } from '@storybook/angular';
import { Button } from '../button';
import { DialogBody } from './dialog-body';
import { DialogFooter } from './dialog-footer';
import { DialogHeader } from './dialog-header';
import { DialogRef } from './dialog-ref';
import { DialogTitleDirective } from './dialog-title.directive';
import { DialogService } from './dialog.service';
import { dialogFooterAlign, dialogSize } from './dialog.types';

interface DialogData {
  title: string;
  message: string;
}

@Component({
  selector: 'tls-story-dialog-content',
  template: `
    <tls-dialog-header>
      <h2 tlsDialogTitle>{{ data.title }}</h2>
    </tls-dialog-header>
    <tls-dialog-body>
      <p>{{ data.message }}</p>
    </tls-dialog-body>
    <tls-dialog-footer>
      <tls-button variant="outlined" (click)="dialogRef.close(false)">Cancel</tls-button>
      <tls-button (click)="dialogRef.close(true)">Confirm</tls-button>
    </tls-dialog-footer>
  `,
  imports: [Button, DialogHeader, DialogBody, DialogFooter, DialogTitleDirective],
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
  readonly footerAlign = input<dialogFooterAlign>('end');
  readonly message = input('Are you sure you want to proceed?');

  openDialog(): void {
    this.dialogService.open<boolean, DialogData>(DialogContentComponent, {
      size: this.size(),
      closeable: this.closeable(),
      backdropClose: this.backdropClose(),
      footerAlign: this.footerAlign(),
      data: { title: 'Confirm action', message: this.message() },
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
    footerAlign: 'end',
    message: 'Are you sure you want to proceed?',
  },
  argTypes: {
    size: {
      control: { type: 'select' },
      options: ['sm', 'md', 'lg', 'xl', 'wide', 'full'] satisfies dialogSize[],
    },
    footerAlign: {
      control: { type: 'select' },
      options: [
        'start',
        'center',
        'end',
        'space-between',
      ] satisfies dialogFooterAlign[],
    },
  },
  render: args => ({
    props: args,
    template: `
      <div style="display: flex; justify-content: center; align-items: center; height: 200px;">
        <tls-story-dialog-trigger
          [size]="size"
          [footerAlign]="footerAlign"
          [message]="message"
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

/**
 * Content taller than the viewport: the header and footer stay put while the
 * body scrolls between them.
 */
export const ScrollingBody: Story = {
  args: {
    message: Array.from(
      { length: 40 },
      (_, index) => `Line ${index + 1} of a message long enough to overflow.`,
    ).join(' '),
  },
};