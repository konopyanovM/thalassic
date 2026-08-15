import { NgTemplateOutlet } from '@angular/common';
import {
  afterNextRender,
  ChangeDetectorRef,
  Component,
  computed,
  effect,
  ElementRef,
  inject,
  Injector,
  input,
  InputSignal,
  output,
  OutputEmitterRef,
  signal,
  Signal,
  TemplateRef,
  untracked,
  viewChild
} from '@angular/core';
import { Grid, GridCell, GridRow } from '@angular/aria/grid';
import {
  addDays,
  Day,
  eachDayOfInterval,
  format,
  isSameDay,
  isSameMonth,
  startOfMonth,
  startOfWeek
} from 'date-fns';
import { LOCALE_CONFIG, localeFormatOptions } from '../../abstract/locale';
import { color } from '../../types';
import { createNowSignal, rotateWeekDays } from '../../utils';
import { assignWeekLanes } from './assign-week-lanes';
import { buildMonthScrollPlan, MonthScrollPlan } from './build-month-scroll-plan';
import { CalendarEventItem } from './calendar-event';
import {
  DAY_NUMBER_FORMAT,
  DAYS_PER_WEEK,
  MAX_DAY_MARKERS,
  MONTH_GRID_ROWS,
  NOW_REFRESH_INTERVAL_MS
} from './calendar.constants';
import { CALENDAR_CONFIG } from './calendar.token';
import { CalendarDayContext, CalendarEvent, CalendarEventContext } from './calendar.types';

/** A dot marking one of a day's events in the dense layout, tinted by that event's color. */
interface MonthDayMarker {
  id: string;
  /** Resolved with the cell so the binding keeps one array rather than rebuilding per check. */
  classes: string[];
}

/** A day cell in the month grid: its number and how many of its events are hidden. */
interface MonthDay {
  date: Date;
  dayNumber: string;
  inCurrentMonth: boolean;
  isToday: boolean;
  hiddenCount: number;
  /** How many events cover the day in total, however the layout chooses to present them. */
  eventCount: number;
  markers: MonthDayMarker[];
  /** Built with the cell so a template slot is not handed a fresh object on every check. */
  context: CalendarDayContext;
}

/** A visible event bar placed on the week's lane overlay. */
interface MonthEventBar {
  event: CalendarEvent;
  gridColumn: string;
  gridRow: string;
  continuesBefore: boolean;
  continuesAfter: boolean;
}

/** One week row: the base day cells plus the event bars overlaid across them. */
interface MonthWeek {
  days: MonthDay[];
  bars: MonthEventBar[];
}

@Component({
  selector: 'tls-calendar-month-view',
  templateUrl: './calendar-month-view.html',
  imports: [Grid, GridRow, GridCell, CalendarEventItem, NgTemplateOutlet],
  host: {
    class: 'tls-calendar-month-view',
    '[class.tls-calendar-month-view--square]': 'squareCells()',
  },
})
export class CalendarMonthView {
  // Injections
  private readonly _locale = inject(LOCALE_CONFIG);
  private readonly _config = inject(CALENDAR_CONFIG);
  private readonly _changeDetectorRef = inject(ChangeDetectorRef);
  private readonly _injector = inject(Injector);

  // Inputs
  public readonly activeDate: InputSignal<Date> = input.required<Date>();
  public readonly events: InputSignal<CalendarEvent[]> = input.required<CalendarEvent[]>();
  public readonly weekStartsOn: InputSignal<Day> = input.required<Day>();
  public readonly weekDays: InputSignal<string[]> = input.required<string[]>();
  public readonly maxEventsPerDay: InputSignal<number> = input.required<number>();
  /** Whether day cells are held to a 1:1 ratio instead of sizing to the events they hold. */
  public readonly squareCells: InputSignal<boolean> = input<boolean>(false);
  public readonly eventTemplate = input<TemplateRef<CalendarEventContext> | undefined>(undefined);
  /** Replaces what a day cell renders, leaving the cell's own semantics and chrome in place. */
  public readonly dayTemplate = input<TemplateRef<CalendarDayContext> | undefined>(undefined);
  /** Accessible name for the grid, announced when focus enters it. */
  public readonly label = input<string | undefined>(undefined);

  // Outputs
  public readonly dateSelect: OutputEmitterRef<Date> = output<Date>();
  public readonly eventSelect: OutputEmitterRef<CalendarEvent> = output<CalendarEvent>();

  // State
  private readonly _dateOptions = localeFormatOptions(this._locale);
  /** Ticking current time, so the today highlight tracks the clock across midnight. */
  private readonly _now = createNowSignal(NOW_REFRESH_INTERVAL_MS);

  /** Widened week window a navigation scroll renders through; unset while the grid rests. */
  private readonly _scrollPlan = signal<MonthScrollPlan | null>(null);

  private readonly _grid = viewChild.required<ElementRef<HTMLElement>>('grid');

  /** Settles the scroll in flight at once, so a follow-up navigation starts from rest. */
  private _finalizeScroll: (() => void) | null = null;

  /** Anchor the grid last rendered for, naming the window a navigation scrolls away from. */
  private _renderedDate: Date | null = null;

  // Computed
  protected readonly weekdayHeaders: Signal<string[]> = computed(() =>
    rotateWeekDays(this.weekDays(), this.weekStartsOn()),
  );

  protected readonly weeks: Signal<MonthWeek[]> = computed(() => {
    const activeDate = this.activeDate();
    const maxLanes = this.maxEventsPerDay();
    const events = this.events();
    const now = this._now();

    // A fixed 6-week window keeps the grid height from reflowing between months. While a
    // navigation scroll plays, the window widens to the union of the outgoing and incoming
    // grids so the rows they share stay one element travelling between them.
    const plan = this._scrollPlan();
    const windowStart = plan
      ? plan.unionStart
      : startOfWeek(startOfMonth(activeDate), { weekStartsOn: this.weekStartsOn() });
    const weekCount = plan ? plan.weekCount : MONTH_GRID_ROWS;
    const days = eachDayOfInterval({
      start: windowStart,
      end: addDays(windowStart, weekCount * DAYS_PER_WEEK - 1),
    });

    const weeks: MonthWeek[] = [];
    for (let index = 0; index < days.length; index += DAYS_PER_WEEK) {
      const weekDays = days.slice(index, index + DAYS_PER_WEEK);
      const segments = assignWeekLanes(weekDays, events);

      const hiddenPerColumn = new Array<number>(weekDays.length).fill(0);
      // Segments already carry each event clipped to the columns it covers, so bucketing them
      // here costs nothing beyond the walk — far cheaper than re-testing every event per day.
      const eventsPerColumn: CalendarEvent[][] = weekDays.map(() => []);
      const bars: MonthEventBar[] = [];
      for (const segment of segments) {
        const beyondLanes = segment.lane >= maxLanes;
        if (!beyondLanes) {
          bars.push({
            event: segment.event,
            gridColumn: `${segment.startColumn + 1} / span ${segment.endColumn - segment.startColumn + 1}`,
            gridRow: `${segment.lane + 1}`,
            continuesBefore: segment.continuesBefore,
            continuesAfter: segment.continuesAfter,
          });
        }

        for (let column = segment.startColumn; column <= segment.endColumn; column++) {
          eventsPerColumn[column].push(segment.event);
          if (beyondLanes) hiddenPerColumn[column]++;
        }
      }

      const cells: MonthDay[] = weekDays.map((date, column) => {
        // Lane packing orders segments by column and span; a day's own events read chronologically.
        const dayEvents = eventsPerColumn[column].sort(
          (first, second) => first.start.getTime() - second.start.getTime(),
        );
        const dayNumber = format(date, DAY_NUMBER_FORMAT, this._dateOptions);
        const inCurrentMonth = isSameMonth(date, activeDate);
        const isToday = isSameDay(date, now);
        return {
          date,
          dayNumber,
          inCurrentMonth,
          isToday,
          hiddenCount: hiddenPerColumn[column],
          context: { $implicit: date, dayNumber, inCurrentMonth, isToday, events: dayEvents },
          eventCount: dayEvents.length,
          markers: dayEvents.slice(0, MAX_DAY_MARKERS).map(event => ({
            id: event.id,
            classes: this._markerClasses(event.color),
          })),
        };
      });

      weeks.push({ days: cells, bars });
    }
    return weeks;
  });

  constructor() {
    // A month change scrolls the grid between the two windows; the first render
    // has no outgoing window to scroll away from.
    effect(() => {
      const activeDate = this.activeDate();
      const previous = this._renderedDate;
      this._renderedDate = activeDate;
      if (!previous) return;

      untracked(() => this._scrollBetween(previous, activeDate));
    });
  }

  // Protected methods
  /** Localized "+N more" label for a day cell with `count` hidden events. */
  protected moreLabel(count: number): string {
    return this._config.labels.more(count);
  }

  /** Localized event-count summary, the only textual form the dense layout's dots have. */
  protected eventCountLabel(count: number): string {
    return this._config.labels.eventCount(count);
  }

  /** Space would scroll the page; consume it and select the focused day instead. */
  protected onDaySpace(event: Event, date: Date): void {
    event.preventDefault();
    this.dateSelect.emit(date);
  }

  // Private methods
  /**
   * Slides the grid from `from`'s window to `to`'s: the union of both windows renders at once,
   * pinned to the resting row height, and a translate transition carries it from the outgoing
   * offset to the incoming one. Rows the windows share keep their DOM identity, so their cells
   * cross-fade out of the outside dimming in place rather than being rebuilt.
   *
   * Style writes go to the element directly: the jump to the outgoing offset must paint with
   * the widened render, and the cleanup must paint with the collapsed one — frame boundaries a
   * template binding cannot express.
   */
  private _scrollBetween(from: Date, to: Date): void {
    const plan = buildMonthScrollPlan(from, to, this.weekStartsOn());
    if (!plan) return;

    // A navigation mid-scroll settles the previous scroll first, so the grid and viewport
    // below are measured at rest.
    if (this._finalizeScroll) this._finalizeScroll();

    const grid = this._grid().nativeElement;
    const restingHeight = grid.getBoundingClientRect().height;
    // Nothing visible to scroll (display: none, detached test DOM) — swap without ceremony.
    if (restingHeight === 0) return;
    const rowHeight = restingHeight / MONTH_GRID_ROWS;

    // The viewport wraps the resting grid, so its own height (grid plus its border) is held
    // while the widened grid overflows it; the union render, the pinned rows, and the
    // outgoing offset all apply before the next paint.
    const viewport = grid.parentElement;
    if (viewport) viewport.style.height = `${viewport.getBoundingClientRect().height}px`;
    this._scrollPlan.set(plan);
    grid.classList.add('tls-calendar-month-view__grid--scrolling');
    grid.style.setProperty('--tls-calendar-scroll-row-height', `${rowHeight}px`);
    // The jump to the outgoing offset must not itself transition: the measurements above
    // flushed a style pass holding the resting translate, so without the inline suppression
    // the browser reads the jump as a change to animate from rest.
    grid.style.transition = 'none';
    grid.style.translate = `0 ${-plan.fromRow * rowHeight}px`;

    const finalize = (): void => {
      if (this._finalizeScroll !== finalize) return;
      this._finalizeScroll = null;
      grid.removeEventListener('transitionend', onTransitionEnd);

      // Collapse to the resting render and clear the scroll styles within one task, so the
      // incoming window's rows and the reset translate paint together, pixel-identical to
      // the scroll's final frame.
      this._scrollPlan.set(null);
      this._changeDetectorRef.detectChanges();
      grid.classList.remove('tls-calendar-month-view__grid--scrolling');
      grid.style.transition = '';
      grid.style.translate = '';
      grid.style.removeProperty('--tls-calendar-scroll-row-height');
      if (viewport) viewport.style.height = '';
    };
    this._finalizeScroll = finalize;

    const onTransitionEnd = (event: TransitionEvent): void => {
      if (event.target === grid && event.propertyName === 'translate') finalize();
    };
    grid.addEventListener('transitionend', onTransitionEnd);

    afterNextRender(
      () => {
        // The union rows are in the DOM at the outgoing offset; give them a painted frame,
        // then restore the class's transition and let the offset change animate.
        requestAnimationFrame(() => {
          if (this._finalizeScroll !== finalize) return;
          grid.style.transition = '';
          grid.style.translate = `0 ${-plan.toRow * rowHeight}px`;

          // With motion disabled the transition never runs, so no `transitionend` would ever
          // settle the scroll — resolve it as an instant swap instead.
          requestAnimationFrame(() => {
            if (this._finalizeScroll !== finalize) return;
            if (!parseFloat(getComputedStyle(grid).transitionDuration)) finalize();
          });
        });
      },
      { injector: this._injector },
    );
  }

  private _markerClasses(eventColor: color | undefined): string[] {
    const classes = ['tls-calendar-month-view__marker'];
    if (eventColor) classes.push(`tls-calendar-month-view__marker--${eventColor}`);

    return classes;
  }
}
