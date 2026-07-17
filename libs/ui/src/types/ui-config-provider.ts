import {
  AlertConfig,
  ButtonConfig,
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
  IconConfig,
  InputConfig,
  LoaderConfig,
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
  StepperConfig,
  SwitchConfig,
  TableConfig,
  TabsConfig,
  TabsQuerySyncConfig,
  TextareaConfig,
  ToggleGroupConfig,
  TooltipConfig
} from '../features';
import { FormControlConfig } from '../abstract/form';

export interface tlsUiConfigProvider {
  /** Cross-cutting defaults inherited by every form control (not tied to a single component). */
  formControl?: Partial<FormControlConfig>;
  components: {
    alert?: Partial<AlertConfig>;
    button?: Partial<ButtonConfig>;
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
    icon?: Partial<IconConfig>;
    input?: Partial<InputConfig>;
    loader?: Partial<LoaderConfig>;
    menu?: Partial<MenuConfig>;
    multiSelect?: Partial<MultiSelectConfig>;
    pagination?: Partial<PaginationConfig> & { querySync?: Partial<PaginationQuerySyncConfig> };
    password?: Partial<PasswordConfig>;
    pinInput?: Partial<PinInputConfig>;
    popover?: Partial<PopoverConfig>;
    radioButton?: Partial<RadioButtonConfig>;
    select?: Partial<SelectConfig>;
    skeleton?: Partial<SkeletonConfig>;
    stepper?: Partial<StepperConfig>;
    switch?: Partial<SwitchConfig>;
    table?: Partial<TableConfig>;
    tabs?: Partial<TabsConfig> & { querySync?: Partial<TabsQuerySyncConfig> };
    textarea?: Partial<TextareaConfig>;
    toggleGroup?: Partial<ToggleGroupConfig>;
    tooltip?: Partial<TooltipConfig>;
  };
}
