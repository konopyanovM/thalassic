import {
  ButtonConfig,
  DividerConfig,
  FormItemConfig,
  IconConfig,
  InputConfig,
  PasswordConfig,
  SwitchConfig,
} from '../features';
import { AlertConfig } from '../features/alert';
import { TabsConfig } from '../features/tabs/tabs.config';

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
  };
}
