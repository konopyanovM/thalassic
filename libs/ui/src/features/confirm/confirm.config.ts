import { Point } from '@thalassic/core';
import { overlayPosition } from '../../types';
import { confirmActionsAlign, confirmButton, confirmSize } from './confirm.types';

export interface ConfirmConfig {
  position: overlayPosition;
  offset: Point;
  confirmButton: confirmButton;
  cancelButton: confirmButton;
  actionsAlign: confirmActionsAlign;
  size: confirmSize;
}

export const DEFAULT_CONFIRM_CONFIG: ConfirmConfig = {
  position: 'bottom',
  offset: { x: 0, y: 4 },
  confirmButton: { label: 'Confirm' },
  cancelButton: { label: 'Cancel', variant: 'text' },
  actionsAlign: 'end',
  size: 'md',
};
