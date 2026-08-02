import { NgTemplateOutlet } from '@angular/common';
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
import { format } from 'date-fns';
import { localeFormatOptions, LOCALE_CONFIG } from '../../abstract/locale';
import { TIME_AWARE_VIEWS } from './calendar.constants';
import { CalendarEvent, CalendarEventContext, calendarView } from './calendar.types';

/**
 * Renders a single event as an interactive chip. Owns color resolution, the consumer
 * template-slot fallback, and click-to-select; the containing view owns placement
 * (a month cell's list, a time-grid block, an agenda row).
 */
@Component({
  selector: 'tls-calendar-event',
  templateUrl: './calendar-event.html',
  imports: [NgTemplateOutlet],
  host: { class: 'tls-calendar-event' },
})
export class CalendarEventItem {
  // Injections
  private readonly _locale = inject(LOCALE_CONFIG);

  // Inputs
  public readonly event: InputSignal<CalendarEvent> = input.required<CalendarEvent>();
  public readonly view: InputSignal<calendarView> = input.required<calendarView>();
  public readonly template = input<TemplateRef<CalendarEventContext> | undefined>(undefined);

  // Outputs
  public readonly activate: OutputEmitterRef<CalendarEvent> = output<CalendarEvent>();

  // State
  private readonly _dateOptions = localeFormatOptions(this._locale);

  // Computed
  protected readonly classes: Signal<string[]> = computed(() => {
    const classes = ['tls-calendar-event__button'];
    const color = this.event().color;
    if (color !== undefined) classes.push(`tls-calendar-event__button--${color}`);
    return classes;
  });

  protected readonly context: Signal<CalendarEventContext> = computed(() => ({
    $implicit: this.event(),
    view: this.view(),
  }));

  /** Time-aware views prefix the start time; the month grid shows the title alone. */
  protected readonly defaultLabel: Signal<string> = computed(() => {
    const event = this.event();
    const view = this.view();
    if (TIME_AWARE_VIEWS.includes(view) && event.allDay !== true) {
      return `${format(event.start, 'p', this._dateOptions)} ${event.title}`;
    }
    return event.title;
  });

  // Protected methods
  protected onClick(mouseEvent: MouseEvent): void {
    // Keep the click from also triggering the containing day cell / column selection.
    mouseEvent.stopPropagation();
    this.activate.emit(this.event());
  }
}
