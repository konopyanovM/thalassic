import { Day } from 'date-fns';
import { controlSize } from '../../../types';
import { dateTimePickerMode } from './date-time-picker.types';

export interface DateTimePickerConfig {
  mode: dateTimePickerMode;
  inline: boolean;
  placeholder: string;
  size: controlSize;
  yearsPerPage: number;
  weekStartsOn: Day;
  weekDays: string[];
}

export const DEFAULT_DATE_TIME_PICKER_CONFIG: DateTimePickerConfig = {
  mode: 'calendar',
  inline: false,
  placeholder: '',
  size: 'md',
  yearsPerPage: 12,
  weekStartsOn: 0,
  weekDays: ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'],
};