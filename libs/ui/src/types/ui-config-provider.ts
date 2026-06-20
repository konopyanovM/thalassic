import {
  AlertConfig,
  ButtonConfig,
  DateTimePickerConfig,
  DialogConfig,
  DividerConfig,
  FormControlGroupConfig,
  FormItemConfig,
  IconConfig,
  InputConfig,
  PaginationConfig,
  PasswordConfig,
  PopoverConfig,
  SelectConfig,
  SkeletonConfig,
  StepperConfig,
  SwitchConfig,
  TableConfig,
  TabsConfig,
  TextareaConfig,
  TooltipConfig,
} from '../features';

export interface tlsUiConfigProvider {
  components: {
    alert?: Partial<AlertConfig>;
    button?: Partial<ButtonConfig>;
    dateTimePicker?: Partial<DateTimePickerConfig>;
    dialog?: Partial<DialogConfig>;
    divider?: Partial<DividerConfig>;
    formControlGroup?: Partial<FormControlGroupConfig>;
    input?: Partial<InputConfig>;
    password?: Partial<PasswordConfig>;
    select?: Partial<SelectConfig>;
    switch?: Partial<SwitchConfig>;
    formItem?: Partial<FormItemConfig>;
    icon?: Partial<IconConfig>;
    pagination?: Partial<PaginationConfig>;
    popover?: Partial<PopoverConfig>;
    skeleton?: Partial<SkeletonConfig>;
    stepper?: Partial<StepperConfig>;
    table?: Partial<TableConfig>;
    tabs?: Partial<TabsConfig>;
    textarea?: Partial<TextareaConfig>;
    tooltip?: Partial<TooltipConfig>;
  };
}
