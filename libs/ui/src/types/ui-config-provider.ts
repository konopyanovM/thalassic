import {
  AlertConfig,
  ButtonConfig,
  CheckboxConfig,
  ChipConfig,
  ChipControlConfig,
  ChipInputConfig,
  DateTimePickerConfig,
  DialogConfig,
  DividerConfig,
  FileUploaderConfig,
  FormControlGroupConfig,
  FormItemConfig,
  IconConfig,
  InputConfig,
  LoaderConfig,
  MenuConfig,
  MultiSelectConfig,
  PaginationConfig,
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
  TextareaConfig,
  ToggleGroupConfig,
  TooltipConfig,
} from '../features';

export interface tlsUiConfigProvider {
  components: {
    alert?: Partial<AlertConfig>;
    button?: Partial<ButtonConfig>;
    checkbox?: Partial<CheckboxConfig>;
    chip?: Partial<ChipConfig>;
    chipControl?: Partial<ChipControlConfig>;
    chipInput?: Partial<ChipInputConfig>;
    dateTimePicker?: Partial<DateTimePickerConfig>;
    dialog?: Partial<DialogConfig>;
    divider?: Partial<DividerConfig>;
    fileUploader?: Partial<FileUploaderConfig>;
    formControlGroup?: Partial<FormControlGroupConfig>;
    formItem?: Partial<FormItemConfig>;
    icon?: Partial<IconConfig>;
    input?: Partial<InputConfig>;
    loader?: Partial<LoaderConfig>;
    menu?: Partial<MenuConfig>;
    multiSelect?: Partial<MultiSelectConfig>;
    pagination?: Partial<PaginationConfig>;
    password?: Partial<PasswordConfig>;
    pinInput?: Partial<PinInputConfig>;
    popover?: Partial<PopoverConfig>;
    radioButton?: Partial<RadioButtonConfig>;
    select?: Partial<SelectConfig>;
    skeleton?: Partial<SkeletonConfig>;
    stepper?: Partial<StepperConfig>;
    switch?: Partial<SwitchConfig>;
    table?: Partial<TableConfig>;
    tabs?: Partial<TabsConfig>;
    textarea?: Partial<TextareaConfig>;
    toggleGroup?: Partial<ToggleGroupConfig>;
    tooltip?: Partial<TooltipConfig>;
  };
}
