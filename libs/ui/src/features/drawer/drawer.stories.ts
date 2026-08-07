import { DIALOG_DATA } from '@angular/cdk/dialog';
import { Component, inject, input } from '@angular/core';
import { Meta, moduleMetadata, StoryObj } from '@storybook/angular';
import { Button } from '../button';
import { DrawerRef } from './drawer-ref';
import { DrawerService } from './drawer.service';
import { drawerSide, drawerSize } from './drawer.types';

interface DrawerData {
  title: string;
  message: string;
}

@Component({
  selector: 'tls-story-drawer-content',
  template: `
    <div class="tls-drawer__header">
      <span class="tls-drawer__title">{{ data.title }}</span>
    </div>
    <div class="tls-drawer__body">
      <p>{{ data.message }}</p>
    </div>
    <div class="tls-drawer__footer">
      <tls-button variant="outlined" (click)="drawerRef.close(false)">Cancel</tls-button>
      <tls-button (click)="drawerRef.close(true)">Confirm</tls-button>
    </div>
  `,
  imports: [Button],
})
class DrawerContentComponent {
  protected readonly drawerRef = inject<DrawerRef<boolean>>(DrawerRef);
  protected readonly data = inject<DrawerData>(DIALOG_DATA);
}

@Component({
  selector: 'tls-story-drawer-trigger',
  template: `<tls-button (click)="openDrawer()">Open drawer</tls-button>`,
  imports: [Button],
})
class DrawerTriggerComponent {
  private readonly drawerService = inject(DrawerService);

  readonly side = input<drawerSide>('end');
  readonly size = input<drawerSize | string>('md');
  readonly closeable = input(true);
  readonly backdropClose = input(true);
  readonly rounded = input(false);
  readonly grabber = input(false);

  openDrawer(): void {
    this.drawerService.open<boolean, DrawerData>(DrawerContentComponent, {
      side: this.side(),
      size: this.size(),
      closeable: this.closeable(),
      backdropClose: this.backdropClose(),
      rounded: this.rounded(),
      grabber: this.grabber(),
      data: { title: 'Drawer title', message: 'Content slides in from the chosen edge.' },
    });
  }
}

const meta: Meta<DrawerTriggerComponent> = {
  component: DrawerTriggerComponent,
  title: 'Drawer',
  decorators: [
    moduleMetadata({
      imports: [DrawerContentComponent],
    }),
  ],
  args: {
    side: 'end',
    size: 'md',
    closeable: true,
    backdropClose: true,
    rounded: false,
    grabber: false,
  },
  argTypes: {
    side: {
      control: { type: 'select' },
      options: ['start', 'end', 'top', 'bottom'] satisfies drawerSide[],
    },
    size: {
      control: { type: 'select' },
      options: ['sm', 'md', 'lg', 'full', 'auto'] satisfies drawerSize[],
    },
  },
  render: args => ({
    props: args,
    template: `
      <div style="display: flex; justify-content: center; align-items: center; height: 200px;">
        <tls-story-drawer-trigger
          [side]="side"
          [size]="size"
          [closeable]="closeable"
          [backdropClose]="backdropClose"
          [rounded]="rounded"
          [grabber]="grabber"
        />
      </div>
    `,
  }),
};
export default meta;

type Story = StoryObj<DrawerTriggerComponent>;

export const Drawer: Story = {};

export const BottomSheet: Story = {
  args: {
    side: 'bottom',
    size: 'auto',
    rounded: true,
    grabber: true,
    closeable: false,
  },
};
