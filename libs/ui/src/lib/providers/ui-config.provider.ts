import { EnvironmentProviders, makeEnvironmentProviders } from '@angular/core';
import {
  BUTTON_CONFIG,
  DEFAULT_BUTTON_CONFIG,
  DEFAULT_ICON_CONFIG,
  DEFAULT_INPUT_CONFIG,
  DEFAULT_PASSWORD_CONFIG,
  DEFAULT_SWITCH_CONFIG,
  ICON_CONFIG,
  INPUT_CONFIG,
  PASSWORD_CONFIG,
  SWITCH_CONFIG,
} from '../features';
import { tlsUiConfigProvider } from '../types';

export const provideThalassicUIConfig = (config: tlsUiConfigProvider): EnvironmentProviders => {
  return makeEnvironmentProviders([
    // Components
    { provide: BUTTON_CONFIG, useValue: { ...DEFAULT_BUTTON_CONFIG, ...config.components.button } },
    { provide: INPUT_CONFIG, useValue: { ...DEFAULT_INPUT_CONFIG, ...config.components.input } },
    {
      provide: PASSWORD_CONFIG,
      useValue: { ...DEFAULT_PASSWORD_CONFIG, ...config.components.password },
    },
    { provide: SWITCH_CONFIG, useValue: { ...DEFAULT_SWITCH_CONFIG, ...config.components.switch } },
    { provide: ICON_CONFIG, useValue: { ...DEFAULT_ICON_CONFIG, ...config.components.icon } },
  ]);
};
