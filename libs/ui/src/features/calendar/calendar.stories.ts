import { argsToTemplate, Meta, StoryObj } from '@storybook/angular';
import { addDays, setHours, startOfMonth, startOfWeek } from 'date-fns';
import { Calendar } from './calendar';
import { CalendarEvent } from './calendar.types';

const monthStart = startOfMonth(new Date());
const weekStart = startOfWeek(new Date());

const timed = (dayOffset: number, startHour: number, endHour: number) => ({
  start: setHours(addDays(weekStart, dayOffset), startHour),
  end: setHours(addDays(weekStart, dayOffset), endHour),
});

const TIMED_EVENTS: CalendarEvent[] = [
  { id: 'w1', title: 'Standup', ...timed(1, 9, 10), color: 'info' },
  // Overlaps w1 to show side-by-side lanes.
  { id: 'w2', title: 'Pairing', ...timed(1, 9, 11) },
  { id: 'w3', title: 'Lunch', ...timed(2, 12, 13) },
  { id: 'w4', title: 'Workshop', ...timed(3, 13, 15), color: 'success' },
  { id: 'w5', title: 'Company holiday', start: addDays(weekStart, 4), allDay: true, color: 'danger' },
];

const SAMPLE_EVENTS: CalendarEvent[] = [
  { id: '1', title: 'Team standup', start: addDays(monthStart, 2), color: 'success' },
  { id: '2', title: 'Design review', start: addDays(monthStart, 9), color: 'info' },
  { id: '3', title: 'Conference', start: addDays(monthStart, 14), end: addDays(monthStart, 16) },
  { id: '4', title: '1:1 with Sam', start: addDays(monthStart, 14) },
  { id: '5', title: 'Sprint planning', start: addDays(monthStart, 14) },
  { id: '6', title: 'Release cut', start: addDays(monthStart, 14), color: 'danger' },
  { id: '7', title: 'Retro', start: addDays(monthStart, 21), color: 'tertiary' },
];

const meta: Meta<Calendar> = {
  component: Calendar,
  title: 'Calendar',
  args: {
    view: 'month',
    weekStartsOn: 0,
    hourStart: 0,
    hourEnd: 24,
    showAllDayRow: true,
    maxEventsPerDay: 3,
    ariaLabel: 'Calendar',
    events: SAMPLE_EVENTS,
  },
  argTypes: {
    view: { control: { type: 'select' }, options: ['month', 'week', 'day', 'agenda'] },
    weekStartsOn: { control: { type: 'select' }, options: [0, 1, 2, 3, 4, 5, 6] },
    hourStart: { control: { type: 'number', min: 0, max: 24 } },
    hourEnd: { control: { type: 'number', min: 0, max: 24 } },
    showAllDayRow: { control: { type: 'boolean' } },
    maxEventsPerDay: { control: { type: 'number', min: 1 } },
    ariaLabel: { control: { type: 'text' } },
    // Fixtures and derived state — driven by the stories, not the controls panel.
    events: { control: false },
    activeDate: { control: false },
  },
  render: args => ({
    props: args,
    template: `<tls-calendar ${argsToTemplate(args)} />`,
  }),
};
export default meta;

type Story = StoryObj<Calendar>;

export const Default: Story = {};

/** Week view: a time-grid with overlapping events laid into side-by-side lanes. */
export const Week: Story = {
  args: { view: 'week', events: TIMED_EVENTS },
};

/** Day view: the same time-grid narrowed to a single column. */
export const Day: Story = {
  args: { view: 'day', events: TIMED_EVENTS, activeDate: addDays(weekStart, 1) },
};

/** Agenda view: the month's events as a chronological list, empty days omitted. */
export const Agenda: Story = {
  args: { view: 'agenda' },
};

/** A consumer `#eventTemplate` fully overrides the default event chip. */
export const CustomEventTemplate: Story = {
  render: args => ({
    props: args,
    template: `
      <tls-calendar ${argsToTemplate(args)}>
        <ng-template #eventTemplate let-event>
          &#9679; {{ event.title }}
        </ng-template>
      </tls-calendar>
    `,
  }),
};
