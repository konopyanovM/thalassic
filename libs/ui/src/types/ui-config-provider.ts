import {
  AlertConfig,
  ButtonConfig,
  DividerConfig,
  FormItemConfig,
  IconConfig,
  InputConfig,
  PasswordConfig,
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
    divider?: Partial<DividerConfig>;
    input?: Partial<InputConfig>;
    password?: Partial<PasswordConfig>;
    select?: Partial<SelectConfig>;
    switch?: Partial<SwitchConfig>;
    formItem?: Partial<FormItemConfig>;
    icon?: Partial<IconConfig>;
    skeleton?: Partial<SkeletonConfig>;
    stepper?: Partial<StepperConfig>;
    table?: Partial<TableConfig>;
    tabs?: Partial<TabsConfig>;
    tooltip?: Partial<TooltipConfig>;
  };
}
