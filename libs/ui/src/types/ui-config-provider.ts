import {
  AlertConfig,
  AutocompleteConfig,
  ButtonConfig,
  CalendarConfig,
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
  PaginationQuerySyncConfig,
  PasswordConfig,
  PinInputConfig,
  PopoverConfig,
  RadioButtonConfig,
  SelectConfig,
  SkeletonConfig,
  SplitterConfig,
  StepperConfig,
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
  TooltipConfig
} from '../features';
import { AccessibilityConfig } from '../abstract/accessibility';
import { FormControlConfig } from '../abstract/form';

export interface tlsUiConfigProvider {
  /** Cross-cutting accessibility policy applied across every component (not tied to a single one). */
  accessibility?: Partial<AccessibilityConfig>;
  /** Cross-cutting defaults inherited by every form control (not tied to a single component). */
  formControl?: Partial<FormControlConfig>;
  components: {
    alert?: Partial<AlertConfig>;
    autocomplete?: Partial<AutocompleteConfig>;
    button?: Partial<ButtonConfig>;
    calendar?: Partial<CalendarConfig>;
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
    pagination?: Partial<PaginationConfig> & { querySync?: Partial<PaginationQuerySyncConfig> };
    password?: Partial<PasswordConfig>;
    pinInput?: Partial<PinInputConfig>;
    popover?: Partial<PopoverConfig>;
    radioButton?: Partial<RadioButtonConfig>;
    select?: Partial<SelectConfig>;
    skeleton?: Partial<SkeletonConfig>;
    splitter?: Partial<SplitterConfig>;
    stepper?: Partial<StepperConfig>;
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
  };
}
