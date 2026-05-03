import {
  AlertConfig,
  ButtonConfig,
  DividerConfig,
  FormItemConfig,
  IconConfig,
  InputConfig,
  PasswordConfig,
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
    tabs?: Partial<TabsConfig>;
    tooltip?: Partial<TooltipConfig>;
  };
}
