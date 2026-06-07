import {
  AlertConfig,
  ButtonConfig,
  DateTimePickerConfig,
  DividerConfig,
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
  TooltipConfig,
} from '../features';

export interface tlsUiConfigProvider {
  components: {
    alert?: Partial<AlertConfig>;
    button?: Partial<ButtonConfig>;
    dateTimePicker?: Partial<DateTimePickerConfig>;
    divider?: Partial<DividerConfig>;
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
    tooltip?: Partial<TooltipConfig>;
  };
}
