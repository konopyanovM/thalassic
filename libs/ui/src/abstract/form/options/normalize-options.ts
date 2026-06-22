import { Option } from './option';
import { optionInput } from './option-input';

export interface OptionKeys<T> {
  label: keyof T | undefined;
  value: keyof T | undefined;
  disabled: keyof T | undefined;
}

export function normalizeOptions<T, V = unknown>(
  options: optionInput<T>[],
  keys: OptionKeys<T>,
): Option<V>[] {
  return options.map(option => {
    if (typeof option === 'string' || typeof option === 'number') {
      return { value: option as V, label: String(option), disabled: false };
    }

    const typed = option as T;

    return {
      value: (keys.value ? typed[keys.value] : typed) as V,
      label: String(keys.label ? typed[keys.label] : typed),
      disabled: Boolean(keys.disabled ? typed[keys.disabled] : false),
    };
  });
}
