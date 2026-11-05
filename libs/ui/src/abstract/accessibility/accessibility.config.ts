export interface AccessibilityConfig {
  /**
   * Expands interactive controls to the accessible minimum tap target (44px) on touch
   * devices, without changing their visual size or disturbing layout. Disabled by
   * default: the overflowing hit areas of tightly packed controls overlap and take each
   * other's edge taps, so enabling it presumes a layout spaced for them.
   */
  expandTouchTargets: boolean;
  /**
   * Renders controls one step taller on a device whose primary pointer is coarse
   * (sm 36px, md 44px, lg 52px instead of 28 / 36 / 44), so a finger gets a visibly
   * larger control rather than only a larger invisible hit area. Applies to every
   * control on the shared height scale, so a field and a button of one size still
   * line up. Disabled by default: it changes layout, which a consumer opts into.
   */
  enlargeTouchControls: boolean;
}

export const DEFAULT_ACCESSIBILITY_CONFIG: AccessibilityConfig = {
  expandTouchTargets: false,
  enlargeTouchControls: false,
};
