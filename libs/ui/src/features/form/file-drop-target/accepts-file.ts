import { acceptInput } from './file-drop-target.types';

/** Joins the parts of an `accept` rule set into the attribute's own format. */
export function normalizeAccept(value: acceptInput): string {
  return Array.isArray(value) ? value.join(',') : value;
}

function rulesOf(accept: string): string[] {
  return accept
    .split(',')
    .map(rule => rule.trim().toLowerCase())
    .filter(Boolean);
}

/** Whether a file satisfies the rule set, by extension or by MIME type. */
export function acceptsFile(file: File, accept: string): boolean {
  const trimmed = accept.trim();
  if (!trimmed) return true;

  const fileName = file.name.toLowerCase();
  const fileType = file.type.toLowerCase();

  return rulesOf(trimmed).some(rule => {
    if (rule.startsWith('.')) return fileName.endsWith(rule);
    if (rule.endsWith('/*')) return fileType.startsWith(rule.slice(0, -1));

    return fileType === rule;
  });
}

/**
 * Whether a rule set refuses a type outright, judged from what a drag exposes.
 *
 * A drag in progress reveals each item's MIME type and nothing else, so a rule
 * set written in extensions cannot be tested until the file is dropped and
 * named. Undecidable is not the same as refused: it answers `false` there, and
 * the drop is filtered afterwards.
 */
export function isTypeRejected(type: string, accept: string): boolean {
  const trimmed = accept.trim();
  if (!trimmed) return false;

  const rules = rulesOf(trimmed);
  if (rules.some(rule => rule.startsWith('.')) || !type) return false;

  const fileType = type.toLowerCase();

  return !rules.some(rule =>
    rule.endsWith('/*') ? fileType.startsWith(rule.slice(0, -1)) : fileType === rule,
  );
}
