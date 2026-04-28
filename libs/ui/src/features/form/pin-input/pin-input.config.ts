import { pinInputType } from './pin-input.types';

export interface PinInputConfig {
  type: pinInputType;
  length: number;
  placeholder: string;
}

export const DEFAULT_PIN_INPUT_CONFIG: PinInputConfig = {
  type: 'numeric',
  length: 4,
  placeholder: '○',
};
