import {
  booleanAttribute,
  Component,
  computed,
  inject,
  input,
  InputSignal,
  InputSignalWithTransform,
} from '@angular/core';
import { color } from '../../types';
import { escapeRegularExpression } from '../../utils';
import { Mark } from '../mark';
import { HIGHLIGHT_CONFIG } from './highlight.token';
import { HighlightSegment } from './highlight.types';

@Component({
  selector: 'tls-highlight',
  imports: [Mark],
  templateUrl: './highlight.html',
})
export class Highlight {
  // Injections
  private readonly _config = inject(HIGHLIGHT_CONFIG);

  // Inputs
  public readonly text: InputSignal<string> = input.required<string>();
  public readonly query = input<string | string[] | undefined>(undefined);
  public readonly color: InputSignal<color> = input<color>(this._config.color);
  public readonly caseSensitive: InputSignalWithTransform<boolean, unknown> = input(
    this._config.caseSensitive,
    { transform: booleanAttribute },
  );

  // Computed
  private readonly _queries = computed<string[]>(() => {
    const query = this.query();
    if (query === undefined) return [];

    const queries = Array.isArray(query) ? query : [query];

    // Longest term first, so an overlapping shorter term cannot shadow a longer
    // match in the regex alternation (e.g. 'ab' wins over 'a').
    return queries.filter(item => item.length > 0).sort((left, right) => right.length - left.length);
  });

  protected readonly segments = computed<HighlightSegment[]>(() => {
    const text = this.text();
    const queries = this._queries();
    if (text.length === 0 || queries.length === 0) return [{ text, matched: false }];

    const flags = this.caseSensitive() ? 'g' : 'gi';
    const pattern = new RegExp(queries.map(escapeRegularExpression).join('|'), flags);

    const segments: HighlightSegment[] = [];
    let lastIndex = 0;

    for (const match of text.matchAll(pattern)) {
      if (match.index > lastIndex) {
        segments.push({ text: text.slice(lastIndex, match.index), matched: false });
      }
      segments.push({ text: match[0], matched: true });
      lastIndex = match.index + match[0].length;
    }

    if (lastIndex < text.length) segments.push({ text: text.slice(lastIndex), matched: false });

    return segments;
  });
}
