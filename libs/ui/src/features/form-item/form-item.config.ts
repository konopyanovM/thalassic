import { DEFAULT_FORM_ITEM_ERROR_MESSAGES, ErrorMessageMap } from './form-item.constants';

export interface FormItemConfig {
  reserveErrorSpace: boolean;
  reserveLabelSpace: boolean;
  displayErrors: boolean;
  /** Whether required fields are marked with a `*`. */
  showRequiredMarker: boolean;
  /** Text appended to non-required fields (e.g. `(optional)`). Not shown when omitted. */
  optionalText?: string;
  errorMessages: ErrorMessageMap;
}

export const DEFAULT_FORM_ITEM_CONFIG: FormItemConfig = {
  reserveErrorSpace: true,
  reserveLabelSpace: false,
  displayErrors: true,
  showRequiredMarker: true,
  errorMessages: DEFAULT_FORM_ITEM_ERROR_MESSAGES,
};
