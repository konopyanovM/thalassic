import { controlSize } from '../../types';

export interface FormControlGroupConfig {
  size: controlSize;
  fluid: boolean;
}

export const DEFAULT_FORM_CONTROL_GROUP_CONFIG: FormControlGroupConfig = {
  size: 'md',
  fluid: false,
};

