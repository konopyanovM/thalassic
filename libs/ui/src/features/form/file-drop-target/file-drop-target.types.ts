/** The `accept` rule set, as the attribute string or the parts of one. */
export type acceptInput = string | string[];

/**
 * What a drag currently hovering the target holds: nothing (`idle`), files the
 * target accepts (`valid`), or files it would refuse (`invalid`).
 */
export type fileDragState = 'idle' | 'valid' | 'invalid';
