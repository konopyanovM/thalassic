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
    props: { ...args, rows: MOCK_ROWS, columns: COLUMNS },
    template: `
      <tls-table [data]="rows" [columnDefinitions]="columns" ${argsToTemplate(args)}>
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
