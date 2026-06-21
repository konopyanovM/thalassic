import { EnvironmentProviders, makeEnvironmentProviders } from '@angular/core';
import { deepMerge } from '@thalassic/core';
import {
  ALERT_CONFIG,
  BUTTON_CONFIG,
  CHECKBOX_CONFIG,
  CHIP_CONFIG,
  CHIP_CONTROL_CONFIG,
  CHIP_INPUT_CONFIG,
  DATE_TIME_PICKER_CONFIG,
  DEFAULT_ALERT_CONFIG,
  DEFAULT_BUTTON_CONFIG,
  DEFAULT_CHECKBOX_CONFIG,
  DEFAULT_CHIP_CONFIG,
  DEFAULT_CHIP_CONTROL_CONFIG,
  DEFAULT_CHIP_INPUT_CONFIG,
  DEFAULT_DATE_TIME_PICKER_CONFIG,
  DEFAULT_DIALOG_CONFIG,
  DEFAULT_DIVIDER_CONFIG,
  DEFAULT_FILE_UPLOADER_CONFIG,
  DEFAULT_FORM_CONTROL_GROUP_CONFIG,
  DEFAULT_FORM_ITEM_CONFIG,
  DEFAULT_ICON_CONFIG,
  DEFAULT_INPUT_CONFIG,
  DEFAULT_LOADER_CONFIG,
  DEFAULT_MENU_CONFIG,
  DEFAULT_MULTI_SELECT_CONFIG,
  DEFAULT_PAGINATION_CONFIG,
  DEFAULT_PASSWORD_CONFIG,
  DEFAULT_PIN_INPUT_CONFIG,
  DEFAULT_POPOVER_CONFIG,
  DEFAULT_RADIO_BUTTON_CONFIG,
  DEFAULT_SELECT_CONFIG,
  DEFAULT_SKELETON_CONFIG,
  DEFAULT_STEPPER_CONFIG,
  DEFAULT_SWITCH_CONFIG,
  DEFAULT_TABLE_CONFIG,
  DEFAULT_TABS_CONFIG,
  DEFAULT_TEXTAREA_CONFIG,
  DEFAULT_TOGGLE_GROUP_CONFIG,
  DEFAULT_TOOLTIP_CONFIG,
  DIALOG_CONFIG,
  DIVIDER_CONFIG,
  FILE_UPLOADER_CONFIG,
  FORM_CONTROL_GROUP_CONFIG,
  FORM_ITEM_CONFIG,
  ICON_CONFIG,
  INPUT_CONFIG,
  LOADER_CONFIG,
  MENU_CONFIG,
  MULTI_SELECT_CONFIG,
  PAGINATION_CONFIG,
  PASSWORD_CONFIG,
  PIN_INPUT_CONFIG,
  POPOVER_CONFIG,
  RADIO_BUTTON_CONFIG,
  SELECT_CONFIG,
  SKELETON_CONFIG,
  STEPPER_CONFIG,
  SWITCH_CONFIG,
  TABLE_CONFIG,
  TABS_CONFIG,
  TEXTAREA_CONFIG,
  TOGGLE_GROUP_CONFIG,
  TOOLTIP_CONFIG,
} from '../features';
import { tlsUiConfigProvider } from '../types';

export const provideThalassicUIConfig = (config: tlsUiConfigProvider): EnvironmentProviders => {
  return makeEnvironmentProviders([
    // Components
    {
      provide: ALERT_CONFIG,
      useValue: deepMerge(DEFAULT_ALERT_CONFIG, config.components.alert),
    },
    {
      provide: BUTTON_CONFIG,
      useValue: deepMerge(DEFAULT_BUTTON_CONFIG, config.components.button),
    },
    {
      provide: CHECKBOX_CONFIG,
      useValue: deepMerge(DEFAULT_CHECKBOX_CONFIG, config.components.checkbox),
    },
    { provide: CHIP_CONFIG, useValue: deepMerge(DEFAULT_CHIP_CONFIG, config.components.chip) },
    {
      provide: CHIP_CONTROL_CONFIG,
      useValue: deepMerge(DEFAULT_CHIP_CONTROL_CONFIG, config.components.chipControl),
    },
    {
      provide: CHIP_INPUT_CONFIG,
      useValue: deepMerge(DEFAULT_CHIP_INPUT_CONFIG, config.components.chipInput),
    },
    {
      provide: DATE_TIME_PICKER_CONFIG,
      useValue: deepMerge(DEFAULT_DATE_TIME_PICKER_CONFIG, config.components.dateTimePicker),
    },
    {
      provide: DIALOG_CONFIG,
      useValue: deepMerge(DEFAULT_DIALOG_CONFIG, config.components.dialog),
    },
    {
      provide: DIVIDER_CONFIG,
      useValue: deepMerge(DEFAULT_DIVIDER_CONFIG, config.components.divider),
    },
    {
      provide: FILE_UPLOADER_CONFIG,
      useValue: deepMerge(DEFAULT_FILE_UPLOADER_CONFIG, config.components.fileUploader),
    },
    {
      provide: FORM_CONTROL_GROUP_CONFIG,
      useValue: deepMerge(DEFAULT_FORM_CONTROL_GROUP_CONFIG, config.components.formControlGroup),
    },
    {
      provide: FORM_ITEM_CONFIG,
      useValue: deepMerge(DEFAULT_FORM_ITEM_CONFIG, config.components.formItem),
    },
    { provide: ICON_CONFIG, useValue: deepMerge(DEFAULT_ICON_CONFIG, config.components.icon) },
    { provide: INPUT_CONFIG, useValue: deepMerge(DEFAULT_INPUT_CONFIG, config.components.input) },
    {
      provide: LOADER_CONFIG,
      useValue: deepMerge(DEFAULT_LOADER_CONFIG, config.components.loader),
    },
    { provide: MENU_CONFIG, useValue: deepMerge(DEFAULT_MENU_CONFIG, config.components.menu) },
    {
      provide: MULTI_SELECT_CONFIG,
      useValue: deepMerge(DEFAULT_MULTI_SELECT_CONFIG, config.components.multiSelect),
    },
    {
      provide: PAGINATION_CONFIG,
      useValue: deepMerge(DEFAULT_PAGINATION_CONFIG, config.components.pagination),
    },
    {
      provide: PASSWORD_CONFIG,
      useValue: deepMerge(DEFAULT_PASSWORD_CONFIG, config.components.password),
    },
    {
      provide: PIN_INPUT_CONFIG,
      useValue: deepMerge(DEFAULT_PIN_INPUT_CONFIG, config.components.pinInput),
    },
    {
      provide: POPOVER_CONFIG,
      useValue: deepMerge(DEFAULT_POPOVER_CONFIG, config.components.popover),
    },
    {
      provide: RADIO_BUTTON_CONFIG,
      useValue: deepMerge(DEFAULT_RADIO_BUTTON_CONFIG, config.components.radioButton),
    },
    {
      provide: SELECT_CONFIG,
      useValue: deepMerge(DEFAULT_SELECT_CONFIG, config.components.select),
    },
    {
      provide: SKELETON_CONFIG,
      useValue: deepMerge(DEFAULT_SKELETON_CONFIG, config.components.skeleton),
    },
    {
      provide: STEPPER_CONFIG,
      useValue: deepMerge(DEFAULT_STEPPER_CONFIG, config.components.stepper),
    },
    {
      provide: SWITCH_CONFIG,
      useValue: deepMerge(DEFAULT_SWITCH_CONFIG, config.components.switch),
    },
    { provide: TABLE_CONFIG, useValue: deepMerge(DEFAULT_TABLE_CONFIG, config.components.table) },
    { provide: TABS_CONFIG, useValue: deepMerge(DEFAULT_TABS_CONFIG, config.components.tabs) },
    {
      provide: TEXTAREA_CONFIG,
      useValue: deepMerge(DEFAULT_TEXTAREA_CONFIG, config.components.textarea),
    },
    {
      provide: TOGGLE_GROUP_CONFIG,
      useValue: deepMerge(DEFAULT_TOGGLE_GROUP_CONFIG, config.components.toggleGroup),
    },
    {
      provide: TOOLTIP_CONFIG,
      useValue: deepMerge(DEFAULT_TOOLTIP_CONFIG, config.components.tooltip),
    },
  ]);
};
