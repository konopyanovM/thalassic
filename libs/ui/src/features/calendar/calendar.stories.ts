import { Meta, StoryObj } from '@storybook/angular';
import { addDays, startOfMonth } from 'date-fns';
import { Calendar } from './calendar';
import { CalendarEvent } from './calendar.types';

const monthStart = startOfMonth(new Date());

const SAMPLE_EVENTS: CalendarEvent[] = [
  { id: '1', title: 'Team standup', start: addDays(monthStart, 2), color: 'success' },
  { id: '2', title: 'Design review', start: addDays(monthStart, 9), color: 'info' },
  { id: '3', title: 'Conference', start: addDays(monthStart, 14), end: addDays(monthStart, 16) },
  { id: '4', title: '1:1 with Sam', start: addDays(monthStart, 14) },
  { id: '5', title: 'Sprint planning', start: addDays(monthStart, 14) },
  { id: '6', title: 'Release cut', start: addDays(monthStart, 14), color: 'danger' },
  // Raw CSS color escape hatch for arbitrary category colors.
  { id: '7', title: 'Retro', start: addDays(monthStart, 21), color: '#7c3aed' },
];

const meta: Meta<Calendar> = {
  component: Calendar,
  title: 'Calendar',
  render: args => ({
    props: { ...args, events: SAMPLE_EVENTS },
    template: `<tls-calendar [events]="events" />`,
  }),
};
export default meta;

type Story = StoryObj<Calendar>;

export const Default: Story = {};

/** A consumer `#eventTemplate` fully overrides the default event chip. */
export const CustomEventTemplate: Story = {
  render: args => ({
    props: { ...args, events: SAMPLE_EVENTS },
    template: `
      <tls-calendar [events]="events">
        <ng-template #eventTemplate let-event>
          &#9679; {{ event.title }}
        </ng-template>
      </tls-calendar>
    `,
  }),
};
