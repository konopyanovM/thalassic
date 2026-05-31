import { argsToTemplate, Meta, StoryObj } from '@storybook/angular';
import { Pagination as PaginationComponent } from './pagination';

const meta: Meta<PaginationComponent> = {
  component: PaginationComponent,
  title: 'Pagination',
  args: {
    value: 1,
    total: 100,
    pageSize: 10,
    size: 'md',
    boundaries: 1,
    siblings: 1,
    showFirstButton: false,
    showLastButton: false,
  },
  argTypes: {
    value: { control: { type: 'number' } },
    total: { control: { type: 'number' } },
    pageSize: { control: { type: 'number' } },
    size: { control: { type: 'select' }, options: ['sm', 'md', 'lg'] },
    boundaries: { control: { type: 'number' } },
    siblings: { control: { type: 'number' } },
    showFirstButton: { control: { type: 'boolean' } },
    showLastButton: { control: { type: 'boolean' } },
  },
  render: args => ({
    props: args,
    template: `<tls-pagination ${argsToTemplate(args)}></tls-pagination>`,
  }),
};
export default meta;

type Story = StoryObj<PaginationComponent>;

export const Pagination: Story = {};
