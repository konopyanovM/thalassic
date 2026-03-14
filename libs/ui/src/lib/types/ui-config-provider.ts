import { ButtonConfig, IconConfig, InputConfig, PasswordConfig, SwitchConfig } from '../features';
import { ThemeConfig } from '../features/theme/theme.config';

export interface tlsUiConfigProvider {
  theme?: Partial<ThemeConfig>;
  components: {
    button?: Partial<ButtonConfig>;
    input?: Partial<InputConfig>;
    password?: Partial<PasswordConfig>;
    switch?: Partial<SwitchConfig>;
    icon?: Partial<IconConfig>;
  };
}
