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
    views: ['month', 'week', 'day', 'agenda'],
    showHeader: true,
    showTitle: true,
    showNavigation: true,
    showViewSwitcher: true,
    compact: 'auto',
    squareCells: false,
    swipeNavigation: false,
    ariaLabel: 'Calendar',
    events: SAMPLE_EVENTS,
  },
  argTypes: {
    view: { control: { type: 'select' }, options: ['month', 'week', 'day', 'agenda'] },
    views: {
      control: { type: 'check' },
      options: ['month', 'week', 'day', 'agenda'],
    },
    showHeader: { control: { type: 'boolean' } },
    showTitle: { control: { type: 'boolean' } },
    showNavigation: { control: { type: 'boolean' } },
    showViewSwitcher: { control: { type: 'boolean' } },
    compact: { control: { type: 'select' }, options: [true, false, 'auto'] },
    squareCells: { control: { type: 'boolean' } },
    swipeNavigation: { control: { type: 'boolean' } },
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

/** Vertical touch swipe over the month grid pages it: up to the next month, down to the previous. */
export const SwipeNavigation: Story = {
  args: { swipeNavigation: true },
};

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

/**
 * The dense layout resolving on its own: at 380px the header reflows to two rows and the month
 * grid trades its event bars for a dot per event under each day number, all from the calendar's
 * own width. Selecting a single event is not reachable here — days emit `dateSelect` instead.
 */
export const Compact: Story = {
  render: args => ({
    props: args,
    template: `<div style="max-width: 380px"><tls-calendar ${argsToTemplate(args)} /></div>`,
  }),
};

/**
 * Square day cells: the grid's height follows from its width, so the month keeps one shape at
 * every size instead of growing with the events a day holds.
 */
export const SquareCells: Story = {
  args: { squareCells: true },
};

/** The dense layout pinned on, regardless of how much room the calendar actually has. */
export const CompactForced: Story = {
  args: { compact: true },
};

/**
 * A narrow-layout setup that sidesteps the month grid altogether, offering only the two views
 * that read well in a single column.
 */
export const NarrowViews: Story = {
  args: { view: 'agenda', views: ['day', 'agenda'], maxEventsPerDay: 2 },
  render: args => ({
    props: args,
    template: `<div style="max-width: 380px"><tls-calendar ${argsToTemplate(args)} /></div>`,
  }),
};

/**
 * Grid lines are custom properties rather than inputs, so a family can be retinted, rethickened
 * or dropped from a single declaration, and the change reaches every view at once:
 * `--tls-calendar-line-horizontal`, `--tls-calendar-line-vertical` and `--tls-calendar-line-outer`.
 */
export const GridLines: Story = {
  render: args => ({
    props: args,
    template: `
      <tls-calendar
        ${argsToTemplate(args)}
        style="--tls-calendar-line-vertical: none; --tls-calendar-line-outer: none"
      />
    `,
  }),
};

/** Header suppressed entirely, leaving the surrounding page to own the calendar's chrome. */
export const HeadlessHeader: Story = {
  args: { showHeader: false },
};

/**
 * A consumer `#dayTemplate` replaces what a month day cell renders — its number, event dots and
 * "+N more" — while the cell keeps its grid semantics, selection and borders. The context carries
 * the day, its formatted number, `inCurrentMonth`, `isToday` and every event covering it.
 *
 * Event bars are laid out by the week row, above the cells, so they survive a custom cell.
 * Pair with `maxEventsPerDay: 0` to suppress them and own the day's presentation entirely.
 */
export const CustomDayTemplate: Story = {
  args: { maxEventsPerDay: 0 },
  render: args => ({
    props: args,
    template: `
      <tls-calendar ${argsToTemplate(args)}>
        <ng-template #dayTemplate let-day let-events="events" let-inCurrentMonth="inCurrentMonth">
          <div style="display: flex; flex-direction: column; gap: 4px; padding: 4px">
            <strong [style.opacity]="inCurrentMonth ? 1 : 0.4">{{ day.getDate() }}</strong>
            @for (event of events; track event.id) {
              <small>{{ event.title }}</small>
            }
          </div>
        </ng-template>
      </tls-calendar>
    `,
  }),
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
