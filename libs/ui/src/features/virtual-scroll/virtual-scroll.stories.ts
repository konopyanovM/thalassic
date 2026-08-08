import { argsToTemplate, Meta, StoryObj } from '@storybook/angular';
import { VirtualScroll as VirtualScrollComponent } from './virtual-scroll';
import { DEFAULT_VIRTUAL_SCROLL_CONFIG } from './virtual-scroll.config';

interface MockRow {
  id: number;
  name: string;
  email: string;
}

const MOCK_ROWS: MockRow[] = Array.from({ length: 100000 }, (_, index) => ({
  id: index,
  name: `Person ${index}`,
  email: `person.${index}@example.com`,
}));

// An item has to occupy exactly the extent the container assumes for it, which the
// container publishes as --tls-virtual-scroll-item-size.
const ROW_STYLE = [
  'box-sizing: border-box',
  'height: var(--tls-virtual-scroll-item-size)',
  'display: flex',
  'align-items: center',
  'justify-content: space-between',
  'padding-inline: var(--spacing-4)',
  'border-block-end: 1px solid var(--color-outline-variant)',
].join('; ');

const meta: Meta<VirtualScrollComponent<MockRow>> = {
  component: VirtualScrollComponent,
  title: 'Virtual scroll',
  args: {
    itemSize: DEFAULT_VIRTUAL_SCROLL_CONFIG.itemSize,
    minBufferPx: DEFAULT_VIRTUAL_SCROLL_CONFIG.minBufferPx,
    maxBufferPx: DEFAULT_VIRTUAL_SCROLL_CONFIG.maxBufferPx,
    orientation: DEFAULT_VIRTUAL_SCROLL_CONFIG.orientation,
    appendOnly: DEFAULT_VIRTUAL_SCROLL_CONFIG.appendOnly,
  },
  argTypes: {
    itemSize: { control: { type: 'number' } },
    minBufferPx: { control: { type: 'number' } },
    maxBufferPx: { control: { type: 'number' } },
    orientation: { control: { type: 'inline-radio' }, options: ['vertical', 'horizontal'] },
    appendOnly: { control: { type: 'boolean' } },
  },
  render: args => ({
    props: { ...args, rows: MOCK_ROWS },
    template: `
      <div style="height: 400px; border: 1px solid var(--color-outline-variant); border-radius: var(--radius-md)">
        <tls-virtual-scroll
          [items]="rows"
          trackBy="id"
          viewportRole="list"
          ariaLabel="People"
          ${argsToTemplate(args)}
        >
          <ng-template #item let-row let-index="index" let-count="count">
            <div role="listitem" [attr.aria-posinset]="index + 1" [attr.aria-setsize]="count" style="${ROW_STYLE}">
              <span>{{ row.name }}</span>
              <span style="color: var(--color-on-surface-variant)">{{ row.email }}</span>
            </div>
          </ng-template>
        </tls-virtual-scroll>
      </div>
    `,
  }),
};
export default meta;

type Story = StoryObj<VirtualScrollComponent<MockRow>>;

export const VirtualScroll: Story = {};
