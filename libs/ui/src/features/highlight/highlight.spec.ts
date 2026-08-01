import { Component, input } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Highlight } from './highlight';

@Component({
  imports: [Highlight],
  template: `<tls-highlight
    [text]="text()"
    [query]="query()"
    [caseSensitive]="caseSensitive()"
  ></tls-highlight>`,
})
class HighlightHost {
  readonly text = input<string>('');
  readonly query = input<string | string[] | undefined>(undefined);
  readonly caseSensitive = input<boolean>(false);
}

describe('Highlight', () => {
  let fixture: ComponentFixture<HighlightHost>;

  const render = async (
    text: string,
    query: string | string[] | undefined,
    caseSensitive = false,
  ): Promise<HTMLElement> => {
    fixture.componentRef.setInput('text', text);
    fixture.componentRef.setInput('query', query);
    fixture.componentRef.setInput('caseSensitive', caseSensitive);
    await fixture.whenStable();

    return fixture.nativeElement as HTMLElement;
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HighlightHost],
    }).compileComponents();

    fixture = TestBed.createComponent(HighlightHost);
  });

  it('should create', async () => {
    const element = await render('hello', undefined);
    expect(element.textContent).toBe('hello');
  });

  it('renders the full text without marks when no query is set', async () => {
    const element = await render('hello world', undefined);
    expect(element.querySelectorAll('mark').length).toBe(0);
    expect(element.textContent).toBe('hello world');
  });

  it('wraps matches in mark elements', async () => {
    const element = await render('hello world', 'world');
    const marks = element.querySelectorAll('mark');
    expect(marks.length).toBe(1);
    expect(marks[0].textContent).toBe('world');
    expect(element.textContent).toBe('hello world');
  });

  it('matches case-insensitively by default', async () => {
    const element = await render('Hello World', 'world');
    const marks = element.querySelectorAll('mark');
    expect(marks.length).toBe(1);
    expect(marks[0].textContent).toBe('World');
  });

  it('respects case sensitivity when enabled', async () => {
    const element = await render('Hello World', 'world', true);
    expect(element.querySelectorAll('mark').length).toBe(0);
  });

  it('marks every occurrence and every query term', async () => {
    const element = await render('one two one three', ['one', 'three']);
    const marks = Array.from(element.querySelectorAll('mark')).map(mark => mark.textContent);
    expect(marks).toEqual(['one', 'one', 'three']);
    expect(element.textContent).toBe('one two one three');
  });

  it('prefers the longest term when query terms overlap', async () => {
    const element = await render('abc', ['a', 'ab']);
    const marks = element.querySelectorAll('mark');
    expect(marks.length).toBe(1);
    expect(marks[0].textContent).toBe('ab');
  });

  it('treats RegExp metacharacters in the query literally', async () => {
    const element = await render('price (usd)', '(usd)');
    const marks = element.querySelectorAll('mark');
    expect(marks.length).toBe(1);
    expect(marks[0].textContent).toBe('(usd)');
  });
});
