import { direction } from '../types';

/** Every valid {@link direction}, used to validate untrusted values (e.g. localStorage). */
export const DIRECTIONS: readonly direction[] = ['ltr', 'rtl'];
