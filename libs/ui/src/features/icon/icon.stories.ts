import { applicationConfig, Meta, moduleMetadata, StoryObj } from '@storybook/angular';
import { Icon as IconComponent } from './icon';
import { provideThalassicIcons } from './provide-thalassic-icons';
import { systemIcon } from './system-icon';

const ALL_ICONS: systemIcon[] = [
  'check',
  'indeterminate',
  'chevron-up',
  'chevron-down',
  'chevron-left',
  'chevron-right',
  'chevrons-left',
  'chevrons-right',
  'close',
  'success',
  'warning',
  'error',
  'info',
];

const GALLERY_TEMPLATE = `
  <div style="display:flex;flex-wrap:wrap;gap:24px;font-size:28px;">
    @for (icon of icons; track icon) {
      <div style="display:flex;flex-direction:column;align-items:center;gap:8px;width:96px;">
        <tls-icon [name]="icon" />
        <small style="font-size:12px;color:var(--color-on-surface-variant);">{{ icon }}</small>
      </div>
    }
  </div>
`;

const meta: Meta<IconComponent> = {
  component: IconComponent,
  title: 'Icon',
  decorators: [moduleMetadata({ imports: [IconComponent] })],
};
export default meta;

type Story = StoryObj<IconComponent>;

/** The built-in `systemIcon` set, rendered at the current text color and size. */
export const DefaultSet: Story = {
  render: () => ({ props: { icons: ALL_ICONS }, template: GALLERY_TEMPLATE }),
};

/** A single content icon loaded from a URL via `iconSrc`. */
export const FromUrl: Story = {
  args: {
    iconSrc: 'https://api.iconify.design/lucide/star.svg',
    allowedSources: ['https://api.iconify.design'],
  },
};

/**
 * The same gallery after `provideThalassicIcons` swaps a few names for a filled
 * kit — every component that uses those names picks the override up for free.
 */
export const Overridden: Story = {
  decorators: [
    applicationConfig({
      providers: [
        provideThalassicIcons({
          check: filled('<path d="M9 16.17 4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" />'),
          close: filled(
            '<path d="M19 6.41 17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z" />',
          ),
          'chevron-down': filled('<path d="M7.41 8.59 12 13.17l4.59-4.58L18 10l-6 6-6-6z" />'),
        }),
      ],
    }),
  ],
  render: () => ({ props: { icons: ALL_ICONS }, template: GALLERY_TEMPLATE }),
};

function filled(body: string): string {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">${body}</svg>`;
}
