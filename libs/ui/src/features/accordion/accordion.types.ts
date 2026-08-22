export type accordionVariant = 'flat' | 'outlined' | 'separated';

/**
 * Rank the item headings occupy in the document outline. An accordion sits
 * somewhere inside a page whose headings already run `h1`, `h2`, … so the level
 * is chosen by the surrounding content rather than fixed by the component.
 * `h1` is excluded: it names the page, never a collapsible section.
 */
export type accordionHeadingLevel = 2 | 3 | 4 | 5 | 6;
