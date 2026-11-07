import {
  DEFAULT_FORM_ITEM_ERROR_MESSAGES,
  DEFAULT_FORM_ITEM_UNKNOWN_ERROR_MESSAGE,
  ErrorMessageFn,
  ErrorMessageMap,
} from './form-item.constants';

export interface FormItemConfig {
  reserveErrorSpace: boolean;
  reserveLabelSpace: boolean;
  displayErrors: boolean;
  /** Whether required fields are marked with a `*`. */
  showRequiredMarker: boolean;
  /**
   * Text beside the label of a question that may be skipped (e.g. `(optional)`): a control bound to
   * a form field that is not required and is not a toggle. Not shown when omitted or `undefined`,
   * which a scoped override sets to drop the marker from part of the app.
   */
  optionalText?: string | undefined;
  errorMessages: ErrorMessageMap;
  /** Fallback for an error kind absent from `errorMessages` that carries no `message` of its own. */
  unknownErrorMessage: ErrorMessageFn;
}

export const DEFAULT_FORM_ITEM_CONFIG: FormItemConfig = {
  reserveErrorSpace: true,
  reserveLabelSpace: false,
  displayErrors: true,
  showRequiredMarker: true,
  errorMessages: DEFAULT_FORM_ITEM_ERROR_MESSAGES,
  unknownErrorMessage: DEFAULT_FORM_ITEM_UNKNOWN_ERROR_MESSAGE,
};
