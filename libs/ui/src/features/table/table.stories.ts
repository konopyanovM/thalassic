import { argsToTemplate, Meta, moduleMetadata, StoryObj } from '@storybook/angular';
import { Table as TableComponent } from './table';
import { TableColumn } from './table-column';
import { DEFAULT_TABLE_CONFIG } from './table.config';
import { TableColumnDefinition } from './table.types';

const MOCK_ROWS = [
  { name: 'Alice Johnson', role: 'Admin', status: 'Active', email: 'alice@example.com' },
  { name: 'Bob Smith', role: 'Editor', status: 'Inactive', email: 'bob@example.com' },
  { name: 'Carol White', role: 'Viewer', status: 'Active', email: 'carol@example.com' },
  { name: 'David Lee', role: 'Editor', status: 'Active', email: 'david@example.com' },
];

const COLUMNS: TableColumnDefinition[] = [
  { key: 'name', header: 'Name' },
  { key: 'role', header: 'Role' },
  { key: 'status', header: 'Status' },
  { key: 'email', header: 'Email' },
];

const meta: Meta<TableComponent> = {
  component: TableComponent,
  title: 'Table',
  decorators: [
    moduleMetadata({
      imports: [TableColumn],
    }),
  ],
  args: {
    hideHeader: DEFAULT_TABLE_CONFIG.hideHeader,
    striped: DEFAULT_TABLE_CONFIG.striped,
  },
  argTypes: {
    hideHeader: { control: { type: 'boolean' } },
    striped: { control: { type: 'boolean' } },
  },
  render: args => ({
    props: { ...args, rows: MOCK_ROWS, columnList: COLUMNS },
    template: `
      <tls-table [data]="rows" [columnDefinitions]="columnList" ${argsToTemplate(args)}>
        <tls-table-column key="status">
          <ng-template let-value let-even="even">
            <span [style.opacity]="even ? '1' : '0.6'">{{ value }}</span>
          </ng-template>
        </tls-table-column>
      </tls-table>
    `,
  }),
};
export default meta;

type Story = StoryObj<TableComponent>;

export const Table: Story = {};

/**
 * Below `collapseAt` a row stops being a line of columns: `fold` columns move under the kept cells
 * as labelled lines, `hide` columns drop out. The width measured is the table's own, so resize the
 * preview pane rather than the browser to see it switch.
 */
export const Collapsing: Story = {
  render: () => ({
    props: {
      rows: MOCK_ROWS,
      columnList: [
        { key: 'name', header: 'Name' },
        { key: 'role', header: 'Role', collapse: 'fold' },
        { key: 'status', header: 'Status', collapse: 'fold' },
        { key: 'email', header: 'Email', collapse: 'hide' },
      ] satisfies TableColumnDefinition[],
    },
    template: `
      <tls-table [data]="rows" [columnDefinitions]="columnList" collapseAt="md" />
    `,
  }),
};

export const Scrollable: Story = {
  render: () => ({
    props: {
      rows: Array.from({ length: 100 }, (_, index) => ({
        name: `Person ${index + 1}`,
        role: index % 3 === 0 ? 'Admin' : 'Editor',
        status: index % 2 === 0 ? 'Active' : 'Inactive',
        email: `person${index + 1}@example.com`,
      })),
      columnList: COLUMNS,
    },
    template: `
      <tls-table [data]="rows" [columnDefinitions]="columnList" [maxHeight]="320" striped />
    `,
  }),
};
