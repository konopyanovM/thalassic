import {
  Component,
  computed,
  input,
  InputSignal,
  output,
  OutputEmitterRef,
  Signal,
  TemplateRef,
} from '@angular/core';
import { eachDayOfInterval, endOfMonth, format, isToday, startOfMonth } from 'date-fns';
import { CalendarEventItem } from './calendar-event';
import { AGENDA_DATE_FORMAT, AGENDA_WEEKDAY_FORMAT } from './calendar.constants';
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
  // Inputs
  public readonly activeDate: InputSignal<Date> = input.required<Date>();
  public readonly events: InputSignal<CalendarEvent[]> = input.required<CalendarEvent[]>();
  public readonly eventTemplate = input<TemplateRef<CalendarEventContext> | undefined>(undefined);
  /** Accessible name for the agenda list. */
  public readonly label = input<string | undefined>(undefined);

  // Outputs
  public readonly dateSelect: OutputEmitterRef<Date> = output<Date>();
  public readonly eventSelect: OutputEmitterRef<CalendarEvent> = output<CalendarEvent>();

  // Computed
  protected readonly days: Signal<AgendaDay[]> = computed(() => {
    const activeDate = this.activeDate();
    const events = this.events();

    return eachDayOfInterval({ start: startOfMonth(activeDate), end: endOfMonth(activeDate) })
      .map(date => ({
        date,
        weekday: format(date, AGENDA_WEEKDAY_FORMAT),
        dateLabel: format(date, AGENDA_DATE_FORMAT),
        isToday: isToday(date),
        events: eventsForDay(date, events),
      }))
      .filter(day => day.events.length > 0);
  });
}
