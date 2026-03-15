import { ButtonConfig, IconConfig, InputConfig, PasswordConfig, SwitchConfig } from '../features';

export interface tlsUiConfigProvider {
  components: {
    button?: Partial<ButtonConfig>;
    input?: Partial<InputConfig>;
    password?: Partial<PasswordConfig>;
    switch?: Partial<SwitchConfig>;
    icon?: Partial<IconConfig>;
  };
}
