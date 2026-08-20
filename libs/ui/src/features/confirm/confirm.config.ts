import { breakpoint, Point } from '@thalassic/core';
import { overlayPosition } from '../../types';
import { confirmActionsAlign, confirmButton, confirmSize } from './confirm.types';

export interface ConfirmConfig {
  position: overlayPosition;
  offset: Point;
  /**
   * Breakpoint at or below which an anchored confirm opens as a centered modal
   * instead: a small viewport rarely fits a popover beside its trigger, and a
   * focus-trapped dialog is the platform-native confirm there. `null` keeps
   * every triggered confirm anchored. Takes effect only when the app provides
   * the viewport (`provideViewport()`).
   */
  modalBelow: breakpoint | null;
  confirmButton: confirmButton;
  cancelButton: confirmButton;
  actionsAlign: confirmActionsAlign;
  size: confirmSize;
}

export const DEFAULT_CONFIRM_CONFIG: ConfirmConfig = {
  position: 'bottom',
  offset: { x: 0, y: 4 },
  modalBelow: null,
  confirmButton: { label: 'Confirm' },
  cancelButton: { label: 'Cancel', variant: 'text' },
  actionsAlign: 'end',
  size: 'md',
};
