import { Component, input, signal } from '@angular/core';
import { Meta, moduleMetadata, StoryObj } from '@storybook/angular';
import { Sheet } from './sheet';
import { SheetHeaderDirective } from './sheet-header.directive';
import { SheetDetent } from './sheet.types';

@Component({
  selector: 'tls-story-sheet-page',
  imports: [Sheet, SheetHeaderDirective],
  template: `
    <main style="padding: 24px; padding-bottom: var(--tls-sheet-collapsed-size, 0px)">
      <h1>A tall page</h1>
      @for (paragraph of paragraphs; track $index) {
        <p>{{ paragraph }}</p>
      }
    </main>
    <tls-sheet
      [detents]="detents()"
      [modalFrom]="modalFrom()"
      [(detent)]="detent"
      label="Now playing"
      [detentLabels]="{ lip: 'Collapsed', half: 'Half open', full: 'Open' }"
    >
      <ng-template tlsSheetHeader>
        <strong>Track title</strong> · <span>{{ detent() }}</span>
      </ng-template>
      @for (line of lines; track $index) {
        <p style="padding-inline: 24px">{{ line }}</p>
      }
    </tls-sheet>
  `,
})
class SheetPageComponent {
  readonly detents = input<SheetDetent[]>([
    { id: 'lip', size: 'header' },
    { id: 'full', size: '100%' },
  ]);
  readonly modalFrom = input<string | null>('full');
  readonly detent = signal<string>('lip');
  readonly paragraphs = Array.from({ length: 30 }, (_, index) => `Page paragraph ${index + 1}.`);
  readonly lines = Array.from({ length: 40 }, (_, index) => `Sheet line ${index + 1}.`);
}

const meta: Meta<SheetPageComponent> = {
  component: SheetPageComponent,
  title: 'Sheet',
  decorators: [moduleMetadata({ imports: [Sheet, SheetHeaderDirective] })],
};
export default meta;

type Story = StoryObj<SheetPageComponent>;

export const TwoDetents: Story = {
  args: {
    detents: [
      { id: 'lip', size: 'header' },
      { id: 'full', size: '100%' },
    ],
    modalFrom: 'full',
  },
};

export const ThreeDetents: Story = {
  args: {
    detents: [
      { id: 'lip', size: 'header' },
      { id: 'half', size: '50%' },
      { id: 'full', size: 'content' },
    ],
    modalFrom: 'half',
  },
};
