/**
 * Semantic names for the icons the library renders internally (checkbox tick,
 * select chevron, dialog close, toast status glyphs, …). Consumers swap any of
 * them for their own kit via `provideThalassicIcons`, so this list is the icon
 * contract between the library and the app.
 */
export type systemIcon =
  | 'check'
  | 'indeterminate'
  | 'chevron-up'
  | 'chevron-down'
  | 'chevron-left'
  | 'chevron-right'
  | 'chevrons-left'
  | 'chevrons-right'
  | 'close'
  | 'star'
  | 'star-filled'
  | 'success'
  | 'warning'
  | 'error'
  | 'info'
  | 'bold'
  | 'italic'
  | 'strikethrough'
  | 'inline-code'
  | 'bullet-list'
  | 'ordered-list'
  | 'blockquote'
  | 'link'
  | 'code-block'
  | 'zoom-in'
  | 'zoom-out'
  | 'zoom-reset';
