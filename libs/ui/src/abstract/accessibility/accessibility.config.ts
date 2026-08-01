export interface AccessibilityConfig {
  /**
   * Expands interactive controls to the accessible minimum tap target (44px) on touch
   * devices, without changing their visual size or disturbing layout. Enabled by default;
   * disable for dense, desktop-only layouts where a pointer is guaranteed.
   */
  expandTouchTargets: boolean;
}

export const DEFAULT_ACCESSIBILITY_CONFIG: AccessibilityConfig = {
  expandTouchTargets: true,
};
