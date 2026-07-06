import { Component, inject } from '@angular/core';
import { Meta, moduleMetadata, StoryObj } from '@storybook/angular';
import { STORY_OVERLAY_POSITION_OPTIONS } from '../../../.storybook/constants';
import { Button } from '../button';
import { Confirm as ConfirmComponent } from './confirm';
import { ConfirmService } from './confirm.service';

@Component({
  selector: 'tls-confirm-service-demo',
  imports: [Button],
  template: `
    <div style="display: flex; gap: 16px;">
      <tls-button color="danger" (click)="deleteAnchored($event)">Anchored</tls-button>
      <tls-button color="danger" (click)="deleteModal()">Modal</tls-button>
    </div>
    <p>Result: {{ result }}</p>
  `,
})
class ConfirmServiceDemo {
  private readonly _confirm = inject(ConfirmService);

  protected result = '—';

  // Anchored popover: resolved against the clicked trigger.
  protected deleteAnchored(event: MouseEvent): void {
    this._ask({ trigger: event });
  }

  // Centered modal: no trigger, so the dialog traps focus in the viewport.
  protected deleteModal(): void {
    this._ask({});
  }

  private async _ask(anchor: { trigger?: MouseEvent }): Promise<void> {
    const confirmed = await this._confirm.confirm({
      ...anchor,
      title: 'Delete program',
      message: 'This permanently removes the program and all of its exercises.',
      confirm: { label: 'Delete', color: 'danger' },
      cancel: { label: 'Keep' },
    });

    this.result = confirmed ? 'deleted' : 'cancelled';
  }
}

const meta: Meta<ConfirmComponent> = {
  component: ConfirmComponent,
  title: 'Confirm',
  decorators: [
    moduleMetadata({
      imports: [Button, ConfirmServiceDemo],
    }),
  ],
  args: {
    position: 'bottom',
    actionsAlign: 'end',
    title: 'Delete program',
    message: 'This permanently removes the program and all of its exercises.',
    confirm: { label: 'Delete', color: 'danger' },
    cancel: { label: 'Keep' },
  },
  argTypes: {
    position: {
      control: { type: 'select' },
      options: STORY_OVERLAY_POSITION_OPTIONS,
    },
    actionsAlign: {
      control: { type: 'inline-radio' },
      options: ['start', 'center', 'end', 'space-between'],
    },
    offset: { table: { disable: true } },
  },
};
export default meta;

type Story = StoryObj<ConfirmComponent>;

/** Declarative `tls-confirm` driven from its trigger via `toggle`. */
export const Declarative: Story = {
  render: args => ({
    props: args,
    template: `
      <div style="display: flex; justify-content: center; align-items: center; height: 240px;">
        <tls-button (click)="confirmDialog.toggle($event)">Delete program</tls-button>
        <tls-confirm
          #confirmDialog
          [position]="position"
          [actionsAlign]="actionsAlign"
          [title]="title"
          [message]="message"
          [confirm]="confirm"
          [cancel]="cancel"
        ></tls-confirm>
      </div>
    `,
  }),
};

/** Imperative `ConfirmService.confirm(...)` resolving a promise. */
export const Imperative: Story = {
  render: () => ({
    template: `
      <div style="display: flex; flex-direction: column; align-items: center; gap: 16px; height: 240px;">
        <tls-confirm-service-demo></tls-confirm-service-demo>
      </div>
    `,
  }),
};
