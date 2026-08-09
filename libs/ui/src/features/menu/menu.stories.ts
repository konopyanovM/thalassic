import { signal } from '@angular/core';
import { Meta, moduleMetadata, StoryObj } from '@storybook/angular';
import { STORY_OVERLAY_POSITION_OPTIONS } from '../../../.storybook/constants';
import { Button } from '../button';
import { ContextMenuDirective } from './context-menu.directive';
import { Menu as MenuComponent } from './menu';
import { MenuItemComponent } from './menu-item';
import { MenuTriggerDirective } from './menu-trigger.directive';
import { MenuItemDefinition } from './menu.types';

function svgIcon(svg: string): string {
  return `data:image/svg+xml,${encodeURIComponent(svg)}`;
}

const ICON_CUT = svgIcon(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="6" cy="6" r="3"/><circle cx="6" cy="18" r="3"/><line x1="20" y1="4" x2="8.12" y2="15.88"/><line x1="14.47" y1="14.48" x2="20" y2="20"/><line x1="8.12" y1="8.12" x2="12" y2="12"/></svg>`);
const ICON_COPY = svgIcon(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>`);
const ICON_PASTE = svgIcon(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/><rect x="8" y="2" width="8" height="4" rx="1" ry="1"/></svg>`);
const ICON_SELECT = svgIcon(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="2"/><path d="M9 9h6v6H9z"/></svg>`);

const BASIC_ITEMS: MenuItemDefinition[] = [
  { type: 'label', label: 'Edit' },
  { type: 'item', label: 'Cut', shortcut: ['⌘', 'X'], action: () => console.log('cut') },
  { type: 'item', label: 'Copy', shortcut: ['⌘', 'C'], action: () => console.log('copy') },
  { type: 'item', label: 'Paste', shortcut: ['⌘', 'V'], disabled: true },
  { type: 'divider' },
  { type: 'item', label: 'Select All', shortcut: ['⌘', 'A'], action: () => console.log('select all') },
];

const meta: Meta<MenuComponent> = {
  component: MenuComponent,
  title: 'Menu',
  decorators: [
    moduleMetadata({
      imports: [Button, MenuTriggerDirective, ContextMenuDirective, MenuItemComponent],
    }),
  ],
  args: {
    position: 'bottom-start',
    items: BASIC_ITEMS,
  },
  argTypes: {
    position: {
      control: { type: 'select' },
      options: STORY_OVERLAY_POSITION_OPTIONS,
    },
    offset: { table: { disable: true } },
    ariaLabel: { table: { disable: true } },
    inline: { table: { disable: true } },
  },
};
export default meta;

type Story = StoryObj<MenuComponent>;

export const Popup: Story = {
  render: args => ({
    props: args,
    template: `
      <div style="display: flex; justify-content: center; align-items: center; height: 200px;">
        <tls-button [tlsMenuTrigger]="menu">Open menu</tls-button>
        <tls-menu #menu [items]="items" [position]="position"></tls-menu>
      </div>
    `,
  }),
};

export const Inline: Story = {
  render: args => ({
    props: args,
    template: `
      <tls-menu inline [items]="items"></tls-menu>
    `,
  }),
};

export const ContextMenu: Story = {
  render: args => ({
    props: args,
    template: `
      <div style="display: flex; justify-content: center; align-items: center; height: 200px;">
        <div
          [tlsContextMenu]="menu"
          style="padding: 32px 48px; border: 2px dashed currentColor; border-radius: 8px; cursor: context-menu; user-select: none;"
        >
          Right-click anywhere in this area
        </div>
        <tls-menu #menu [items]="items" [position]="position"></tls-menu>
      </div>
    `,
  }),
};

export const WithIcons: Story = {
  render: args => ({
    props: {
      ...args,
      iconItems: [
        { type: 'label', label: 'Edit' },
        { type: 'item', label: 'Cut', icon: ICON_CUT, shortcut: ['⌘', 'X'], action: () => console.log('cut') },
        { type: 'item', label: 'Copy', icon: ICON_COPY, shortcut: ['⌘', 'C'], action: () => console.log('copy') },
        { type: 'item', label: 'Paste', icon: ICON_PASTE, shortcut: ['⌘', 'V'], disabled: true },
        { type: 'divider' },
        { type: 'item', label: 'Select All', icon: ICON_SELECT, shortcut: ['⌘', 'A'], action: () => console.log('select all') },
      ] satisfies MenuItemDefinition[],
    },
    template: `
      <div style="display: flex; justify-content: center; align-items: center; height: 200px;">
        <tls-button [tlsMenuTrigger]="menu">Open menu</tls-button>
        <tls-menu #menu [items]="iconItems" [position]="position"></tls-menu>
      </div>
    `,
  }),
};


export const CheckableItems: Story = {
  render: args => {
    const view = signal({ statusBar: true, minimap: false, sidebar: 'left' });
    const toggle = (key: 'statusBar' | 'minimap') =>
      view.update(value => ({ ...value, [key]: !value[key] }));
    const setSidebar = (sidebar: string) => view.update(value => ({ ...value, sidebar }));

    return {
      props: {
        ...args,
        buildItems: (): MenuItemDefinition[] => {
          const currentView = view();
          return [
            { type: 'label', label: 'Appearance' },
            {
              type: 'item',
              role: 'menuitemcheckbox',
              checked: currentView.statusBar,
              closeOnSelect: false,
              label: 'Status Bar',
              action: () => toggle('statusBar'),
            },
            {
              type: 'item',
              role: 'menuitemcheckbox',
              checked: currentView.minimap,
              closeOnSelect: false,
              label: 'Minimap',
              description: 'Code overview at the edge of the editor',
              action: () => toggle('minimap'),
            },
            { type: 'divider' },
            { type: 'label', label: 'Sidebar position' },
            {
              type: 'item',
              role: 'menuitemradio',
              checked: currentView.sidebar === 'left',
              closeOnSelect: false,
              label: 'Left',
              action: () => setSidebar('left'),
            },
            {
              type: 'item',
              role: 'menuitemradio',
              checked: currentView.sidebar === 'right',
              closeOnSelect: false,
              label: 'Right',
              action: () => setSidebar('right'),
            },
          ];
        },
      },
      template: `
        <div style="display: flex; justify-content: center; align-items: center; height: 260px;">
          <tls-button [tlsMenuTrigger]="menu">View options</tls-button>
          <tls-menu #menu [items]="buildItems()" [position]="position"></tls-menu>
        </div>
      `,
    };
  },
};

export const WithCustomTemplates: Story = {
  render: args => ({
    props: args,
    template: `
      <div style="display: flex; justify-content: center; align-items: center; height: 200px;">
        <tls-button [tlsMenuTrigger]="menu">Open menu</tls-button>
        <tls-menu #menu [items]="items" [position]="position">
          <ng-template #itemTemplate let-item>
            <span style="color: cornflowerblue; font-style: italic;">★ {{ item.label }}</span>
          </ng-template>
          <ng-template #labelTemplate let-item>
            <span class="tls-menu__label" style="color: tomato;">▸ {{ item.label }}</span>
          </ng-template>
          <ng-template #dividerTemplate>
            <div style="margin: 4px 16px; border-top: 2px dashed cornflowerblue; opacity: 0.4;"></div>
          </ng-template>
        </tls-menu>
      </div>
    `,
  }),
};

export const PerItemContent: Story = {
  render: args => ({
    props: {
      ...args,
      perItemItems: [
        { type: 'item', label: 'Cut', shortcut: ['⌘', 'X'], action: () => console.log('cut') },
        { type: 'item', label: 'Copy', shortcut: ['⌘', 'C'], action: () => console.log('copy') },
        { type: 'divider' },
        { type: 'item', label: 'Upgrade to Pro', templateKey: 'upgrade', action: () => console.log('upgrade') },
      ] satisfies MenuItemDefinition[],
    },
    template: `
      <div style="display: flex; justify-content: center; align-items: center; height: 200px;">
        <tls-button [tlsMenuTrigger]="menu">Open menu</tls-button>
        <tls-menu #menu [items]="perItemItems" [position]="position">
          <tls-menu-item key="upgrade">
            <span style="flex: 1;">Upgrade to Pro</span>
            <span style="padding: 2px 6px; border-radius: 6px; background: gold; font-size: 11px; font-weight: 700;">NEW</span>
          </tls-menu-item>
        </tls-menu>
      </div>
    `,
  }),
};

export const WithCustomItem: Story = {
  render: args => ({
    props: {
      ...args,
      customItems: [
        { type: 'item', label: 'Cut', action: () => console.log('cut') },
        { type: 'custom', key: 'profile' },
        { type: 'divider' },
        { type: 'item', label: 'Sign out', action: () => console.log('sign out') },
      ] satisfies MenuItemDefinition[],
    },
    template: `
      <div style="display: flex; justify-content: center; align-items: center; height: 200px;">
        <tls-button [tlsMenuTrigger]="menu">Open menu</tls-button>
        <tls-menu #menu [items]="customItems" [position]="position">
          <tls-menu-item key="profile">
            <div style="display: flex; align-items: center; gap: 8px; padding: 4px 0;">
              <div style="width: 32px; height: 32px; border-radius: 50%; background: currentColor; opacity: 0.2;"></div>
              <div>
                <div style="font-weight: 600;">John Doe</div>
                <div style="font-size: 12px; opacity: 0.6;">john@example.com</div>
              </div>
            </div>
          </tls-menu-item>
        </tls-menu>
      </div>
    `,
  }),
};
