import {
  ButtonConfig,
  FormItemConfig,
  IconConfig,
  InputConfig,
  PasswordConfig,
  SwitchConfig,
} from '../features';

export interface tlsUiConfigProvider {
  components: {
    button?: Partial<ButtonConfig>;
    input?: Partial<InputConfig>;
    password?: Partial<PasswordConfig>;
    switch?: Partial<SwitchConfig>;
    formItem?: Partial<FormItemConfig>;
    icon?: Partial<IconConfig>;
  };
}
