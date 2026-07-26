import { Component, inject } from '@angular/core';
import { applicationConfig, Meta, StoryObj } from '@storybook/angular';
import { provideThalassicUIConfig } from '../../providers';
import { toastPosition, toastStacking } from './toast.types';
import { Button } from '../button';
import { ToastService } from './toast.service';

@Component({
  selector: 'tls-toast-demo',
  imports: [Button],
  template: `
    <div style="display: flex; flex-wrap: wrap; gap: 12px; max-width: 520px;">
      <tls-button (click)="basic()">Show toast</tls-button>
      <tls-button color="success" (click)="saved()">Success</tls-button>
      <tls-button color="danger" (click)="failed()">Danger</tls-button>
      <tls-button color="warning" variant="tonal" (click)="withAction()">With action</tls-button>
      <tls-button variant="outlined" (click)="sticky()">Sticky</tls-button>
      <tls-button variant="outlined" (click)="burst()">Show five (stack)</tls-button>
      <tls-button variant="text" (click)="clear()">Clear all</tls-button>
    </div>
  `,
})
class ToastDemo {
  private readonly _toast = inject(ToastService);

  private _count = 0;

  protected basic(): void {
    this._toast.show({ title: 'Heads up', message: 'This is a toast notification.' });
  }

  protected saved(): void {
    this._toast.success('Your changes have been saved.');
  }

  protected failed(): void {
    this._toast.danger('Something went wrong while saving.');
  }

  protected withAction(): void {
    this._toast.warning('Item moved to trash.', {
      action: { label: 'Undo', handler: () => this._toast.success('Item restored.') },
    });
  }

  protected sticky(): void {
    this._toast.show({ message: 'I stay until you dismiss me.', duration: 0 });
  }

  protected burst(): void {
    for (let index = 0; index < 5; index++) {
      this._toast.show({
        title: `Notification ${++this._count}`,
        message: 'Hover the stack to expand it.',
      });
    }
  }

  protected clear(): void {
    this._toast.clear();
  }
}

const withToastConfig = (position: toastPosition, stacking: toastStacking) =>
  applicationConfig({
    providers: [provideThalassicUIConfig({ components: { toast: { position, stacking } } })],
  });

const meta: Meta<ToastDemo> = {
  component: ToastDemo,
  title: 'Toast',
  render: () => ({ template: `<tls-toast-demo></tls-toast-demo>` }),
};
export default meta;

type Story = StoryObj<ToastDemo>;

/** Default placement (top-end) with the collapsed, hover-to-expand pile. */
export const CollapsedStack: Story = {
  decorators: [withToastConfig('top-end', 'collapsed')],
};

/** Every toast always laid out as a full vertical list. */
export const ExpandedList: Story = {
  decorators: [withToastConfig('top-end', 'expanded')],
};

/** Classic snackbar spot along the bottom center of the viewport. */
export const BottomCenter: Story = {
  decorators: [withToastConfig('bottom-center', 'collapsed')],
};

/**
 * Severity intents retheming: `success`/`info`/`warning`/`danger` are remapped to
 * different colors via config, so the convenience methods render in the app's palette.
 */
export const RethemedSeverities: Story = {
  decorators: [
    applicationConfig({
      providers: [
        provideThalassicUIConfig({
          components: {
            toast: { severityColors: { success: 'tertiary', info: 'secondary' } },
          },
        }),
      ],
    }),
  ],
};
