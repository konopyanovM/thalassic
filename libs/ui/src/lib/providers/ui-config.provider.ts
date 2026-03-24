import { EnvironmentProviders, makeEnvironmentProviders } from '@angular/core';
import {
  BUTTON_CONFIG,
  DEFAULT_BUTTON_CONFIG,
  DEFAULT_FORM_ITEM_CONFIG,
  DEFAULT_ICON_CONFIG,
  DEFAULT_INPUT_CONFIG,
  DEFAULT_PASSWORD_CONFIG,
  DEFAULT_SWITCH_CONFIG,
  FORM_ITEM_CONFIG,
  ICON_CONFIG,
  INPUT_CONFIG,
  PASSWORD_CONFIG,
  SWITCH_CONFIG,
} from '../features';
import { DEFAULT_DIVIDER_CONFIG, DIVIDER_CONFIG } from '../features/divider';
import { DEFAULT_TABS_CONFIG } from '../features/tabs/tabs.config';
import { TABS_CONFIG } from '../features/tabs/tabs.token';
import { tlsUiConfigProvider } from '../types';
import { mergeConfig } from '../utils';

export const provideThalassicUIConfig = (config: tlsUiConfigProvider): EnvironmentProviders => {
  return makeEnvironmentProviders([
    // Components
    {
      provide: BUTTON_CONFIG,
      useValue: mergeConfig(DEFAULT_BUTTON_CONFIG, config.components.button),
    },
    {
      provide: DIVIDER_CONFIG,
      useValue: mergeConfig(DEFAULT_DIVIDER_CONFIG, config.components.divider),
    },
    { provide: INPUT_CONFIG, useValue: mergeConfig(DEFAULT_INPUT_CONFIG, config.components.input) },
    {
      provide: PASSWORD_CONFIG,
      useValue: mergeConfig(DEFAULT_PASSWORD_CONFIG, config.components.password),
    },
    {
      provide: SWITCH_CONFIG,
      useValue: mergeConfig(DEFAULT_SWITCH_CONFIG, config.components.switch),
    },
    {
      provide: FORM_ITEM_CONFIG,
      useValue: mergeConfig(DEFAULT_FORM_ITEM_CONFIG, config.components.formItem),
    },
    { provide: ICON_CONFIG, useValue: mergeConfig(DEFAULT_ICON_CONFIG, config.components.icon) },
    { provide: TABS_CONFIG, useValue: mergeConfig(DEFAULT_TABS_CONFIG, config.components.tabs) },
  ]);
};
