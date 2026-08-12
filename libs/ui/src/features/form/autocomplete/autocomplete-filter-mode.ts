/**
 * How the typed query narrows the option list.
 *
 * - `contains` — keep options whose label contains the query.
 * - `startsWith` — keep options whose label begins with the query.
 * - `none` — keep every option. The list is filtered elsewhere (a server answering the
 *   query), and a second local pass could only drop rows that search returned.
 */
export type autocompleteFilterMode = 'contains' | 'startsWith' | 'none';
