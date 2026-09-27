/** One day cell of the picker grid, with everything its template binds resolved up front. */
export interface DatePickerDay {
  date: Date;
  label: string;
  inCurrentMonth: boolean;
  isToday: boolean;
  isSelected: boolean;
  isDisabled: boolean;
}
