import {
  Component,
  computed,
  inject,
  input,
  InputSignal,
  output,
  OutputEmitterRef,
  Signal,
  TemplateRef,
} from '@angular/core';
import { eachDayOfInterval, endOfMonth, format, isSameDay, startOfMonth } from 'date-fns';
import { localeFormatOptions, LOCALE_CONFIG } from '../../abstract/locale';
import { createNowSignal } from '../../utils';
import { CalendarEventItem } from './calendar-event';
import {
  AGENDA_DATE_FORMAT,
  AGENDA_WEEKDAY_FORMAT,
  NOW_REFRESH_INTERVAL_MS,
} from './calendar.constants';
import { CALENDAR_CONFIG } from './calendar.token';
import { CalendarEvent, CalendarEventContext } from './calendar.types';
import { eventsForDay } from './events-for-day';

/** A day that has events, precomputed for the agenda list. */
interface AgendaDay {
  date: Date;
  weekday: string;
  dateLabel: string;
  isToday: boolean;
  events: CalendarEvent[];
}

/**
 * A chronological list of the active month's events grouped by day; days without events are
 * omitted. Reuses the shared event chip and template slot; carries list — not grid — semantics.
 */
@Component({
  selector: 'tls-calendar-agenda-view',
  templateUrl: './calendar-agenda-view.html',
  imports: [CalendarEventItem],
  host: {
    class: 'tls-calendar-agenda-view',
    role: 'list',
    '[attr.aria-label]': 'label() ?? null',
  },
})
export class CalendarAgendaView {
  // Injections
  private readonly _locale = inject(LOCALE_CONFIG);
  private readonly _config = inject(CALENDAR_CONFIG);

  // Inputs
  public readonly activeDate: InputSignal<Date> = input.required<Date>();
  public readonly events: InputSignal<CalendarEvent[]> = input.required<CalendarEvent[]>();
  public readonly eventTemplate = input<TemplateRef<CalendarEventContext> | undefined>(undefined);
  /** Accessible name for the agenda list. */
  public readonly label = input<string | undefined>(undefined);

  // Outputs
  public readonly dateSelect: OutputEmitterRef<Date> = output<Date>();
  public readonly eventSelect: OutputEmitterRef<CalendarEvent> = output<CalendarEvent>();

  // State
  protected readonly noEventsLabel: string = this._config.labels.noEvents;
  private readonly _dateOptions = localeFormatOptions(this._locale);
  /** Ticking current time, so the today marker tracks the clock across midnight. */
  private readonly _now = createNowSignal(NOW_REFRESH_INTERVAL_MS);

  // Computed
  protected readonly days: Signal<AgendaDay[]> = computed(() => {
    const activeDate = this.activeDate();
    const events = this.events();
    const now = this._now();

    return eachDayOfInterval({ start: startOfMonth(activeDate), end: endOfMonth(activeDate) })
      .map(date => ({
        date,
        weekday: format(date, AGENDA_WEEKDAY_FORMAT, this._dateOptions),
        dateLabel: format(date, AGENDA_DATE_FORMAT, this._dateOptions),
        isToday: isSameDay(date, now),
        events: eventsForDay(date, events),
      }))
      .filter(day => day.events.length > 0);
  });
}
