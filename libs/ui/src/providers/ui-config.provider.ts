import { isPlatformBrowser } from '@angular/common';
import {
  DOCUMENT,
  EnvironmentProviders,
  inject,
  makeEnvironmentProviders,
  PLATFORM_ID,
  provideEnvironmentInitializer,
} from '@angular/core';
import { deepMerge } from '@thalassic/core';
import {
  ACCESSIBILITY_CONFIG,
  AccessibilityConfig,
  DEFAULT_ACCESSIBILITY_CONFIG,
} from '../abstract/accessibility';
import { DEFAULT_FORM_CONTROL_CONFIG, FORM_CONTROL_CONFIG } from '../abstract/form';
import { DEFAULT_LOCALE_CONFIG, LOCALE_CONFIG } from '../abstract/locale';
import {
  ACTIVITY_HEATMAP_CONFIG,
  ActivityHeatmapConfig,
  ALERT_CONFIG,
  AUTOCOMPLETE_CONFIG,
  BUTTON_CONFIG,
  CALENDAR_CONFIG,
  CalendarConfig,
  CHECKBOX_CONFIG,
  CHIP_CONFIG,
  CHIP_CONTROL_CONFIG,
  CHIP_GROUP_CONFIG,
  CHIP_INPUT_CONFIG,
  DATE_TIME_PICKER_CONFIG,
  DEFAULT_ACTIVITY_HEATMAP_CONFIG,
  DEFAULT_ALERT_CONFIG,
  DEFAULT_AUTOCOMPLETE_CONFIG,
  DEFAULT_BUTTON_CONFIG,
  DEFAULT_CALENDAR_CONFIG,
  DEFAULT_CHECKBOX_CONFIG,
  DEFAULT_CHIP_CONFIG,
  DEFAULT_CHIP_CONTROL_CONFIG,
  DEFAULT_CHIP_GROUP_CONFIG,
  DEFAULT_CHIP_INPUT_CONFIG,
  DEFAULT_DATE_TIME_PICKER_CONFIG,
  DEFAULT_DIALOG_CONFIG,
  DEFAULT_DIVIDER_CONFIG,
  DEFAULT_FILE_INPUT_CONFIG,
  DEFAULT_FORM_CONTROL_GROUP_CONFIG,
  DEFAULT_FORM_ITEM_CONFIG,
  DEFAULT_HIGHLIGHT_CONFIG,
  DEFAULT_ICON_CONFIG,
  DEFAULT_IMAGE_COMPARE_CONFIG,
  DEFAULT_INPUT_CONFIG,
  DEFAULT_LOADER_CONFIG,
  DEFAULT_MARK_CONFIG,
  DEFAULT_MENU_CONFIG,
  DEFAULT_MULTI_SELECT_CONFIG,
  DEFAULT_PAGINATION_CONFIG,
  DEFAULT_PAGINATION_QUERY_SYNC_CONFIG,
  DEFAULT_PASSWORD_CONFIG,
  DEFAULT_PIN_INPUT_CONFIG,
  DEFAULT_POPOVER_CONFIG,
  DEFAULT_PROGRESS_CONFIG,
  DEFAULT_RADIO_BUTTON_CONFIG,
  DEFAULT_RATING_CONFIG,
  DEFAULT_SELECT_CONFIG,
  DEFAULT_SKELETON_CONFIG,
  DEFAULT_SLIDER_CONFIG,
  DEFAULT_SPLITTER_CONFIG,
  DEFAULT_STEPPER_CONFIG,
  DEFAULT_SWITCH_CONFIG,
  DEFAULT_TAB_NAV_CONFIG,
  DEFAULT_TABLE_CONFIG,
  DEFAULT_TABS_CONFIG,
  DEFAULT_TABS_QUERY_SYNC_CONFIG,
  DEFAULT_TEXTAREA_CONFIG,
  DEFAULT_TOAST_CONFIG,
  DEFAULT_TOGGLE_GROUP_CONFIG,
  DEFAULT_TOOLTIP_CONFIG,
  DIALOG_CONFIG,
  DIVIDER_CONFIG,
  FILE_INPUT_CONFIG,
  FORM_CONTROL_GROUP_CONFIG,
  FORM_ITEM_CONFIG,
  HIGHLIGHT_CONFIG,
  ICON_CONFIG,
  IMAGE_COMPARE_CONFIG,
  INPUT_CONFIG,
  LOADER_CONFIG,
  MARK_CONFIG,
  MENU_CONFIG,
  MULTI_SELECT_CONFIG,
  PAGINATION_CONFIG,
  PAGINATION_QUERY_SYNC_CONFIG,
  PaginationConfig,
  PASSWORD_CONFIG,
  PIN_INPUT_CONFIG,
  POPOVER_CONFIG,
  PROGRESS_CONFIG,
  RADIO_BUTTON_CONFIG,
  RATING_CONFIG,
  RatingConfig,
  SELECT_CONFIG,
  SKELETON_CONFIG,
  SLIDER_CONFIG,
  SPLITTER_CONFIG,
  STEPPER_CONFIG,
  StepperConfig,
  SWITCH_CONFIG,
  TAB_NAV_CONFIG,
  TABLE_CONFIG,
  TABS_CONFIG,
  TABS_QUERY_SYNC_CONFIG,
  TEXTAREA_CONFIG,
  TOAST_CONFIG,
  ToastConfig,
  TOGGLE_GROUP_CONFIG,
  TOOLTIP_CONFIG,
} from '../features';
import { tlsUiConfigProvider } from '../types';

export const provideThalassicUIConfig = (
  config: tlsUiConfigProvider = {},
): EnvironmentProviders => {
  const components = config.components ?? {};

  // Query-sync configs nest under their parent feature in the public API but resolve to their own
  // separate DI tokens, so split the nested `querySync` off from the component's own config.
  const { querySync: paginationQuerySync, ...pagination } = components.pagination ?? {};
  const { querySync: tabsQuerySync, ...tabs } = components.tabs ?? {};

  const accessibility: AccessibilityConfig = deepMerge(
    DEFAULT_ACCESSIBILITY_CONFIG,
    config.accessibility,
  );

  return makeEnvironmentProviders([
    // Cross-cutting accessibility policy
    { provide: ACCESSIBILITY_CONFIG, useValue: accessibility },
    // Cross-cutting locale for date formatting
    {
      provide: LOCALE_CONFIG,
      useValue: deepMerge(DEFAULT_LOCALE_CONFIG, config.locale),
    },
    // Reflect the touch-target opt-out onto the document root. Absent the attribute the
    // expansion is active (accessible by default); this only disables it. The overflow is
    // transparent, so a late (browser-only) reflection causes no visual flash.
    provideEnvironmentInitializer(() => {
      if (accessibility.expandTouchTargets) return;
      if (!isPlatformBrowser(inject(PLATFORM_ID))) return;
      inject(DOCUMENT).documentElement.setAttribute('data-touch-targets', 'off');
    }),
    // Cross-cutting form defaults
    {
      provide: FORM_CONTROL_CONFIG,
      useValue: deepMerge(DEFAULT_FORM_CONTROL_CONFIG, config.formControl),
    },
    // Components
    {
      provide: ACTIVITY_HEATMAP_CONFIG,
      // `labels` is a deep-partial override; deepMerge merges it recursively, but its
      // `Partial<T>` signature only models a shallow partial, so cast to it.
      useValue: deepMerge(
        DEFAULT_ACTIVITY_HEATMAP_CONFIG,
        components.activityHeatmap as Partial<ActivityHeatmapConfig>,
      ),
    },
    {
      provide: ALERT_CONFIG,
      useValue: deepMerge(DEFAULT_ALERT_CONFIG, components.alert),
    },
    {
      provide: AUTOCOMPLETE_CONFIG,
      useValue: deepMerge(DEFAULT_AUTOCOMPLETE_CONFIG, components.autocomplete),
    },
    {
      provide: BUTTON_CONFIG,
      useValue: deepMerge(DEFAULT_BUTTON_CONFIG, components.button),
    },
    {
      provide: CALENDAR_CONFIG,
      // `labels` is a deep-partial override; deepMerge merges it recursively, but its
      // `Partial<T>` signature only models a shallow partial, so cast to it.
      useValue: deepMerge(DEFAULT_CALENDAR_CONFIG, components.calendar as Partial<CalendarConfig>),
    },
    {
      provide: CHECKBOX_CONFIG,
      useValue: deepMerge(DEFAULT_CHECKBOX_CONFIG, components.checkbox),
    },
    { provide: CHIP_CONFIG, useValue: deepMerge(DEFAULT_CHIP_CONFIG, components.chip) },
    {
      provide: CHIP_CONTROL_CONFIG,
      useValue: deepMerge(DEFAULT_CHIP_CONTROL_CONFIG, components.chipControl),
    },
    {
      provide: CHIP_GROUP_CONFIG,
      useValue: deepMerge(DEFAULT_CHIP_GROUP_CONFIG, components.chipGroup),
    },
    {
      provide: CHIP_INPUT_CONFIG,
      useValue: deepMerge(DEFAULT_CHIP_INPUT_CONFIG, components.chipInput),
    },
    {
      provide: DATE_TIME_PICKER_CONFIG,
      useValue: deepMerge(DEFAULT_DATE_TIME_PICKER_CONFIG, components.dateTimePicker),
    },
    {
      provide: DIALOG_CONFIG,
      useValue: deepMerge(DEFAULT_DIALOG_CONFIG, components.dialog),
    },
    {
      provide: DIVIDER_CONFIG,
      useValue: deepMerge(DEFAULT_DIVIDER_CONFIG, components.divider),
    },
    {
      provide: FILE_INPUT_CONFIG,
      useValue: deepMerge(DEFAULT_FILE_INPUT_CONFIG, components.fileInput),
    },
    {
      provide: FORM_CONTROL_GROUP_CONFIG,
      useValue: deepMerge(DEFAULT_FORM_CONTROL_GROUP_CONFIG, components.formControlGroup),
    },
    {
      provide: FORM_ITEM_CONFIG,
      useValue: deepMerge(DEFAULT_FORM_ITEM_CONFIG, components.formItem),
    },
    {
      provide: HIGHLIGHT_CONFIG,
      useValue: deepMerge(DEFAULT_HIGHLIGHT_CONFIG, components.highlight),
    },
    { provide: ICON_CONFIG, useValue: deepMerge(DEFAULT_ICON_CONFIG, components.icon) },
    {
      provide: IMAGE_COMPARE_CONFIG,
      useValue: deepMerge(DEFAULT_IMAGE_COMPARE_CONFIG, components.imageCompare),
    },
    { provide: INPUT_CONFIG, useValue: deepMerge(DEFAULT_INPUT_CONFIG, components.input) },
    {
      provide: LOADER_CONFIG,
      useValue: deepMerge(DEFAULT_LOADER_CONFIG, components.loader),
    },
    { provide: MARK_CONFIG, useValue: deepMerge(DEFAULT_MARK_CONFIG, components.mark) },
    { provide: MENU_CONFIG, useValue: deepMerge(DEFAULT_MENU_CONFIG, components.menu) },
    {
      provide: MULTI_SELECT_CONFIG,
      useValue: deepMerge(DEFAULT_MULTI_SELECT_CONFIG, components.multiSelect),
    },
    {
      provide: PAGINATION_CONFIG,
      // `labels` is a deep-partial override; deepMerge merges it recursively, but its
      // `Partial<T>` signature only models a shallow partial, so cast to it.
      useValue: deepMerge(DEFAULT_PAGINATION_CONFIG, pagination as Partial<PaginationConfig>),
    },
    {
      provide: PAGINATION_QUERY_SYNC_CONFIG,
      useValue: deepMerge(DEFAULT_PAGINATION_QUERY_SYNC_CONFIG, paginationQuerySync),
    },
    {
      provide: PASSWORD_CONFIG,
      useValue: deepMerge(DEFAULT_PASSWORD_CONFIG, components.password),
    },
    {
      provide: PIN_INPUT_CONFIG,
      useValue: deepMerge(DEFAULT_PIN_INPUT_CONFIG, components.pinInput),
    },
    {
      provide: POPOVER_CONFIG,
      useValue: deepMerge(DEFAULT_POPOVER_CONFIG, components.popover),
    },
    {
      provide: PROGRESS_CONFIG,
      useValue: deepMerge(DEFAULT_PROGRESS_CONFIG, components.progress),
    },
    {
      provide: RADIO_BUTTON_CONFIG,
      useValue: deepMerge(DEFAULT_RADIO_BUTTON_CONFIG, components.radioButton),
    },
    {
      provide: RATING_CONFIG,
      // `labels` is a deep-partial override; deepMerge merges it recursively, but its
      // `Partial<T>` signature only models a shallow partial, so cast to it.
      useValue: deepMerge(DEFAULT_RATING_CONFIG, components.rating as Partial<RatingConfig>),
    },
    {
      provide: SELECT_CONFIG,
      useValue: deepMerge(DEFAULT_SELECT_CONFIG, components.select),
    },
    {
      provide: SKELETON_CONFIG,
      useValue: deepMerge(DEFAULT_SKELETON_CONFIG, components.skeleton),
    },
    {
      provide: SLIDER_CONFIG,
      useValue: deepMerge(DEFAULT_SLIDER_CONFIG, components.slider),
    },
    {
      provide: SPLITTER_CONFIG,
      useValue: deepMerge(DEFAULT_SPLITTER_CONFIG, components.splitter),
    },
    {
      provide: STEPPER_CONFIG,
      // `labels` and `step` are deep-partial overrides; deepMerge merges them
      // recursively, but its `Partial<T>` signature only models a shallow
      // partial, so cast to it.
      useValue: deepMerge(DEFAULT_STEPPER_CONFIG, components.stepper as Partial<StepperConfig>),
    },
    {
      provide: SWITCH_CONFIG,
      useValue: deepMerge(DEFAULT_SWITCH_CONFIG, components.switch),
    },
    { provide: TABLE_CONFIG, useValue: deepMerge(DEFAULT_TABLE_CONFIG, components.table) },
    {
      provide: TAB_NAV_CONFIG,
      useValue: deepMerge(DEFAULT_TAB_NAV_CONFIG, components.tabNav),
    },
    { provide: TABS_CONFIG, useValue: deepMerge(DEFAULT_TABS_CONFIG, tabs) },
    {
      provide: TABS_QUERY_SYNC_CONFIG,
      useValue: deepMerge(DEFAULT_TABS_QUERY_SYNC_CONFIG, tabsQuerySync),
    },
    {
      provide: TEXTAREA_CONFIG,
      useValue: deepMerge(DEFAULT_TEXTAREA_CONFIG, components.textarea),
    },
    {
      provide: TOAST_CONFIG,
      // `severityColors` is a deep-partial override; deepMerge merges it recursively,
      // but its `Partial<T>` signature only models a shallow partial, so cast to it.
      useValue: deepMerge(DEFAULT_TOAST_CONFIG, components.toast as Partial<ToastConfig>),
    },
    {
      provide: TOGGLE_GROUP_CONFIG,
      useValue: deepMerge(DEFAULT_TOGGLE_GROUP_CONFIG, components.toggleGroup),
    },
    {
      provide: TOOLTIP_CONFIG,
      useValue: deepMerge(DEFAULT_TOOLTIP_CONFIG, components.tooltip),
    },
  ]);
};
