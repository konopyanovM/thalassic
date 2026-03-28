import { FieldTree } from '@angular/forms/signals';

export type ErrorMessageFn = (fieldTree?: FieldTree<unknown>) => string;

export type ErrorMessageMap = Record<string, ErrorMessageFn>;

export const DEFAULT_FORM_ITEM_ERROR_MESSAGES: ErrorMessageMap = {
  required: () => 'This field is required',
  email: () => 'Enter a valid email address',
  minLength: fieldTree => {
    const min = fieldTree?.().minLength?.();
    return min ? `Minimum length is ${min}` : 'Value is too short';
  },
  maxLength: fieldTree => {
    const max = fieldTree?.().maxLength?.();
    return max ? `Maximum length is ${max}` : 'Value is too long';
  },
  min: fieldTree => {
    const min = fieldTree?.().min?.();
    return min ? `Minimum value is ${min}` : 'Value is too small';
  },
  max: fieldTree => {
    const max = fieldTree?.().max?.();
    return max ? `Maximum value is ${max}` : 'Value is too large';
  },
  pattern: () => 'Invalid format',
};
