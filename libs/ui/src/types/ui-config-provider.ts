import {
  AlertConfig,
  ButtonConfig,
  DividerConfig,
  FormItemConfig,
  IconConfig,
  InputConfig,
  PasswordConfig,
  StepperConfig,
  SwitchConfig,
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
    switch?: Partial<SwitchConfig>;
    formItem?: Partial<FormItemConfig>;
    icon?: Partial<IconConfig>;
    stepper?: Partial<StepperConfig>;
    tabs?: Partial<TabsConfig>;
    tooltip?: Partial<TooltipConfig>;
  };
}
