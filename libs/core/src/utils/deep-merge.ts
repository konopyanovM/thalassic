import { isPlainObject } from './is-plain-object';

export const deepMerge = <T extends object>(
  defaults: T,
  overrides: Partial<T> | undefined,
): T => {
  if (!overrides) return defaults;

  const result = { ...defaults };

  for (const key in overrides) {
    const defaultValue = defaults[key];
    const overrideValue = overrides[key];

    result[key] = (
      isPlainObject(defaultValue) && isPlainObject(overrideValue)
        ? deepMerge(defaultValue, overrideValue as Partial<typeof defaultValue>)
        : overrideValue
    ) as T[typeof key];
  }

  return result;
};
