import { argsToTemplate, Meta, moduleMetadata, StoryObj } from '@storybook/angular';
import { STORY_ORIENTATION_OPTIONS } from '../../../.storybook/constants';
import { Splitter as SplitterComponent } from './splitter';
import { SplitterPanel } from './splitter-panel';

const PANEL_STYLE =
  'display: flex; align-items: center; justify-content: center; height: 100%; padding: 16px;';

const meta: Meta<SplitterComponent> = {
  component: SplitterComponent,
  title: 'Splitter',
  decorators: [moduleMetadata({ imports: [SplitterPanel] })],
  args: {
    orientation: 'horizontal',
    keyboardStep: 5,
  },
  argTypes: {
    orientation: {
      control: { type: 'select' },
      options: STORY_ORIENTATION_OPTIONS,
    },
  },
  render: args => ({
    props: args,
    template: `
      <div style="height: 320px; border: 1px solid var(--color-outline-variant); border-radius: 12px; overflow: hidden;">
        <tls-splitter ${argsToTemplate(args)} ariaLabel="Layout panels">
          <tls-splitter-panel [size]="40">
            <div style="${PANEL_STYLE}">Panel one</div>
          </tls-splitter-panel>
          <tls-splitter-panel [size]="60">
            <div style="${PANEL_STYLE}">Panel two</div>
          </tls-splitter-panel>
        </tls-splitter>
      </div>
    `,
  }),
};
export default meta;

type Story = StoryObj<SplitterComponent>;

export const Horizontal: Story = {
  args: {
    orientation: 'horizontal',
  },
};

export const Vertical: Story = {
  args: {
    orientation: 'vertical',
  },
};

export const ThreePanelsWithConstraints: Story = {
  render: args => ({
    props: args,
    template: `
      <div style="height: 320px; border: 1px solid var(--color-outline-variant); border-radius: 12px; overflow: hidden;">
        <tls-splitter ${argsToTemplate(args)} ariaLabel="Layout panels">
          <tls-splitter-panel [size]="25" [min]="15">
            <div style="${PANEL_STYLE}">Sidebar (min 15%)</div>
          </tls-splitter-panel>
          <tls-splitter-panel [size]="50">
            <div style="${PANEL_STYLE}">Editor</div>
          </tls-splitter-panel>
          <tls-splitter-panel [size]="25" [min]="15">
            <div style="${PANEL_STYLE}">Inspector (min 15%)</div>
          </tls-splitter-panel>
        </tls-splitter>
      </div>
    `,
  }),
};

export const Collapsible: Story = {
  render: args => ({
    props: { ...args, sidebarCollapsed: false },
    template: `
      <div style="display: flex; flex-direction: column; gap: 12px; height: 360px;">
        <button
          type="button"
          (click)="sidebarCollapsed = !sidebarCollapsed"
          style="align-self: flex-start; padding: 8px 12px; border: 1px solid var(--color-outline); border-radius: 8px; background: var(--color-surface-container); color: var(--color-on-surface); cursor: pointer;"
        >
          Toggle sidebar — collapsed: {{ sidebarCollapsed }}
        </button>

        <div style="flex: 1; min-height: 0; border: 1px solid var(--color-outline-variant); border-radius: 12px; overflow: hidden;">
          <tls-splitter ${argsToTemplate(args)} ariaLabel="Layout panels">
            <tls-splitter-panel [size]="25" [min]="15" collapsible [(collapsed)]="sidebarCollapsed">
              <div style="${PANEL_STYLE}">
                Sidebar — drag the gutter past ~10%, or focus it and press ArrowLeft, to collapse
              </div>
            </tls-splitter-panel>
            <tls-splitter-panel [size]="75">
              <div style="${PANEL_STYLE}">Editor</div>
            </tls-splitter-panel>
          </tls-splitter>
        </div>
      </div>
    `,
  }),
};

export const Nested: Story = {
  render: args => ({
    props: args,
    template: `
      <div style="height: 320px; border: 1px solid var(--color-outline-variant); border-radius: 12px; overflow: hidden;">
        <tls-splitter ${argsToTemplate(args)} ariaLabel="Outer layout">
          <tls-splitter-panel [size]="30">
            <div style="${PANEL_STYLE}">Sidebar</div>
          </tls-splitter-panel>
          <tls-splitter-panel [size]="70">
            <tls-splitter orientation="vertical" ariaLabel="Inner layout" style="height: 100%;">
              <tls-splitter-panel [size]="60">
                <div style="${PANEL_STYLE}">Editor</div>
              </tls-splitter-panel>
              <tls-splitter-panel [size]="40">
                <div style="${PANEL_STYLE}">Terminal</div>
              </tls-splitter-panel>
            </tls-splitter>
          </tls-splitter-panel>
        </tls-splitter>
      </div>
    `,
  }),
};
