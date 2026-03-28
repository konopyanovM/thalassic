import { DEFAULT_FORM_ITEM_ERROR_MESSAGES, ErrorMessageMap } from './form-item.constants';

export interface FormItemConfig {
  reserveErrorSpace: boolean;
  displayErrors: boolean;
  errorMessages: ErrorMessageMap;
}

export const DEFAULT_FORM_ITEM_CONFIG: FormItemConfig = {
  reserveErrorSpace: true,
  displayErrors: true,
  errorMessages: DEFAULT_FORM_ITEM_ERROR_MESSAGES,
};
