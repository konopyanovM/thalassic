import {
  ActivityHeatmapConfig,
  ActivityHeatmapLabels,
  AlertConfig,
  AutocompleteConfig,
  ButtonConfig,
  CalendarConfig,
  CalendarLabels,
  calendarView,
  CheckboxConfig,
  ChipConfig,
  ChipControlConfig,
  ChipGroupConfig,
  ChipInputConfig,
  DateTimePickerConfig,
  DialogConfig,
  DividerConfig,
  FileInputConfig,
  FormControlGroupConfig,
  FormItemConfig,
  HighlightConfig,
  IconConfig,
  ImageCompareConfig,
  InputConfig,
  LoaderConfig,
  MarkConfig,
  MenuConfig,
  MultiSelectConfig,
  PaginationConfig,
  PaginationLabels,
  PaginationQuerySyncConfig,
  PasswordConfig,
  PinInputConfig,
  PopoverConfig,
  ProgressConfig,
  RadioButtonConfig,
  RatingConfig,
  RatingLabels,
  SelectConfig,
  SkeletonConfig,
  SliderConfig,
  SplitterConfig,
  StepConfig,
  StepperConfig,
  StepperLabels,
  SwitchConfig,
  TableConfig,
  TabNavConfig,
  TabsConfig,
  TabsQuerySyncConfig,
  TextareaConfig,
  toastColor,
  ToastConfig,
  toastSeverity,
  ToggleGroupConfig,
  TooltipConfig,
  VirtualScrollConfig
} from '../features';
import { AccessibilityConfig } from '../abstract/accessibility';
import { FormControlConfig } from '../abstract/form';
import { LocaleConfig } from '../abstract/locale';

export interface tlsUiConfigProvider {
  /** Cross-cutting accessibility policy applied across every component (not tied to a single one). */
  accessibility?: Partial<AccessibilityConfig>;
  /** Cross-cutting locale used by every component that formats dates (not tied to a single one). */
  locale?: Partial<LocaleConfig>;
  /** Cross-cutting defaults inherited by every form control (not tied to a single component). */
  formControl?: Partial<FormControlConfig>;
  components?: {
    activityHeatmap?: Partial<Omit<ActivityHeatmapConfig, 'labels'>> & {
      labels?: Partial<ActivityHeatmapLabels>;
    };
    alert?: Partial<AlertConfig>;
    autocomplete?: Partial<AutocompleteConfig>;
    button?: Partial<ButtonConfig>;
    calendar?: Partial<Omit<CalendarConfig, 'labels'>> & {
      labels?: Partial<Omit<CalendarLabels, 'views'>> & {
        views?: Partial<Record<calendarView, string>>;
      };
    };
    checkbox?: Partial<CheckboxConfig>;
    chip?: Partial<ChipConfig>;
    chipControl?: Partial<ChipControlConfig>;
    chipGroup?: Partial<ChipGroupConfig>;
    chipInput?: Partial<ChipInputConfig>;
    dateTimePicker?: Partial<DateTimePickerConfig>;
    dialog?: Partial<DialogConfig>;
    divider?: Partial<DividerConfig>;
    fileInput?: Partial<FileInputConfig>;
    formControlGroup?: Partial<FormControlGroupConfig>;
    formItem?: Partial<FormItemConfig>;
    highlight?: Partial<HighlightConfig>;
    icon?: Partial<IconConfig>;
    imageCompare?: Partial<ImageCompareConfig>;
    input?: Partial<InputConfig>;
    loader?: Partial<LoaderConfig>;
    mark?: Partial<MarkConfig>;
    menu?: Partial<MenuConfig>;
    multiSelect?: Partial<MultiSelectConfig>;
    pagination?: Partial<Omit<PaginationConfig, 'labels'>> & {
      labels?: Partial<PaginationLabels>;
      querySync?: Partial<PaginationQuerySyncConfig>;
    };
    password?: Partial<PasswordConfig>;
    pinInput?: Partial<PinInputConfig>;
    popover?: Partial<PopoverConfig>;
    progress?: Partial<ProgressConfig>;
    radioButton?: Partial<RadioButtonConfig>;
    rating?: Partial<Omit<RatingConfig, 'labels'>> & { labels?: Partial<RatingLabels> };
    select?: Partial<SelectConfig>;
    skeleton?: Partial<SkeletonConfig>;
    slider?: Partial<SliderConfig>;
    splitter?: Partial<SplitterConfig>;
    stepper?: Partial<Omit<StepperConfig, 'labels' | 'step'>> & {
      labels?: Partial<StepperLabels>;
      step?: Partial<StepConfig>;
    };
    switch?: Partial<SwitchConfig>;
    table?: Partial<TableConfig>;
    tabNav?: Partial<TabNavConfig>;
    tabs?: Partial<TabsConfig> & { querySync?: Partial<TabsQuerySyncConfig> };
    textarea?: Partial<TextareaConfig>;
    toast?: Partial<Omit<ToastConfig, 'severityColors'>> & {
      severityColors?: Partial<Record<toastSeverity, toastColor>>;
    };
    toggleGroup?: Partial<ToggleGroupConfig>;
    tooltip?: Partial<TooltipConfig>;
    virtualScroll?: Partial<VirtualScrollConfig>;
  };
}
