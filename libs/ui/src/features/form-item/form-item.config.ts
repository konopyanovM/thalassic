import { DEFAULT_FORM_ITEM_ERROR_MESSAGES, ErrorMessageMap } from './form-item.constants';

export interface FormItemConfig {
  reserveErrorSpace: boolean;
  reserveLabelSpace: boolean;
  displayErrors: boolean;
  errorMessages: ErrorMessageMap;
}

export const DEFAULT_FORM_ITEM_CONFIG: FormItemConfig = {
  reserveErrorSpace: true,
  reserveLabelSpace: false,
  displayErrors: true,
  errorMessages: DEFAULT_FORM_ITEM_ERROR_MESSAGES,
};
