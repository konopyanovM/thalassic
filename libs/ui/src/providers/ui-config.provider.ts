import { EnvironmentProviders, makeEnvironmentProviders } from '@angular/core';
import {
  ALERT_CONFIG,
  BUTTON_CONFIG,
  DEFAULT_ALERT_CONFIG,
  DEFAULT_BUTTON_CONFIG,
  DEFAULT_DIVIDER_CONFIG,
  DEFAULT_FORM_ITEM_CONFIG,
  DEFAULT_ICON_CONFIG,
  DEFAULT_INPUT_CONFIG,
  DEFAULT_PASSWORD_CONFIG,
  DEFAULT_STEPPER_CONFIG,
  DEFAULT_SWITCH_CONFIG,
  DEFAULT_TABS_CONFIG,
  DEFAULT_TOOLTIP_CONFIG,
  DIVIDER_CONFIG,
  FORM_ITEM_CONFIG,
  ICON_CONFIG,
  INPUT_CONFIG,
  PASSWORD_CONFIG,
  STEPPER_CONFIG,
  SWITCH_CONFIG,
  TABS_CONFIG,
  TOOLTIP_CONFIG,
} from '../features';
import { tlsUiConfigProvider } from '../types';
import { mergeConfig } from '../utils';

export const provideThalassicUIConfig = (config: tlsUiConfigProvider): EnvironmentProviders => {
  return makeEnvironmentProviders([
    // Components
    {
      provide: ALERT_CONFIG,
      useValue: mergeConfig(DEFAULT_ALERT_CONFIG, config.components.alert),
    },
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
    {
      provide: STEPPER_CONFIG,
      useValue: mergeConfig(DEFAULT_STEPPER_CONFIG, config.components.stepper),
    },
    { provide: TABS_CONFIG, useValue: mergeConfig(DEFAULT_TABS_CONFIG, config.components.tabs) },
    {
      provide: TOOLTIP_CONFIG,
      useValue: mergeConfig(DEFAULT_TOOLTIP_CONFIG, config.components.tooltip),
    },
  ]);
};
