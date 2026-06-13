import { EnvironmentProviders, makeEnvironmentProviders } from '@angular/core';
import {
  ALERT_CONFIG,
  BUTTON_CONFIG,
  DATE_TIME_PICKER_CONFIG,
  DEFAULT_ALERT_CONFIG,
  DEFAULT_BUTTON_CONFIG,
  DEFAULT_DATE_TIME_PICKER_CONFIG,
  DEFAULT_DIALOG_CONFIG,
  DEFAULT_DIVIDER_CONFIG,
  DEFAULT_FORM_ITEM_CONFIG,
  DEFAULT_ICON_CONFIG,
  DEFAULT_INPUT_CONFIG,
  DEFAULT_PAGINATION_CONFIG,
  DEFAULT_PASSWORD_CONFIG,
  DEFAULT_POPOVER_CONFIG,
  DEFAULT_SELECT_CONFIG,
  DEFAULT_SKELETON_CONFIG,
  DEFAULT_STEPPER_CONFIG,
  DEFAULT_SWITCH_CONFIG,
  DEFAULT_TABLE_CONFIG,
  DEFAULT_TABS_CONFIG,
  DEFAULT_TOOLTIP_CONFIG,
  DIALOG_CONFIG,
  DIVIDER_CONFIG,
  FORM_ITEM_CONFIG,
  ICON_CONFIG,
  INPUT_CONFIG,
  PAGINATION_CONFIG,
  PASSWORD_CONFIG,
  POPOVER_CONFIG,
  SELECT_CONFIG,
  SKELETON_CONFIG,
  STEPPER_CONFIG,
  SWITCH_CONFIG,
  TABLE_CONFIG,
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
      provide: DATE_TIME_PICKER_CONFIG,
      useValue: mergeConfig(DEFAULT_DATE_TIME_PICKER_CONFIG, config.components.dateTimePicker),
    },
    {
      provide: DIALOG_CONFIG,
      useValue: mergeConfig(DEFAULT_DIALOG_CONFIG, config.components.dialog),
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
      provide: SELECT_CONFIG,
      useValue: mergeConfig(DEFAULT_SELECT_CONFIG, config.components.select),
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
      provide: PAGINATION_CONFIG,
      useValue: mergeConfig(DEFAULT_PAGINATION_CONFIG, config.components.pagination),
    },
    {
      provide: POPOVER_CONFIG,
      useValue: mergeConfig(DEFAULT_POPOVER_CONFIG, config.components.popover),
    },
    {
      provide: SKELETON_CONFIG,
      useValue: mergeConfig(DEFAULT_SKELETON_CONFIG, config.components.skeleton),
    },
    {
      provide: STEPPER_CONFIG,
      useValue: mergeConfig(DEFAULT_STEPPER_CONFIG, config.components.stepper),
    },
    { provide: TABLE_CONFIG, useValue: mergeConfig(DEFAULT_TABLE_CONFIG, config.components.table) },
    { provide: TABS_CONFIG, useValue: mergeConfig(DEFAULT_TABS_CONFIG, config.components.tabs) },
    {
      provide: TOOLTIP_CONFIG,
      useValue: mergeConfig(DEFAULT_TOOLTIP_CONFIG, config.components.tooltip),
    },
  ]);
};
