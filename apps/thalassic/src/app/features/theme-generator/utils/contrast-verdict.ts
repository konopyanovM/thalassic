import { CONTRAST_AA, CONTRAST_AAA_TEXT } from '../theme-generator.constants';
import { contrastRequirement, contrastVerdict } from '../types';

/**
 * Grades a contrast ratio against a requirement. Only text has an AAA tier;
 * a decorative pair is never graded.
 */
export function contrastVerdictOf(ratio: number, requirement: contrastRequirement): contrastVerdict {
  if (requirement === 'decorative') return 'none';
  if (requirement === 'text' && ratio >= CONTRAST_AAA_TEXT) return 'AAA';
  if (ratio >= CONTRAST_AA[requirement]) return 'AA';
  return 'fail';
}
