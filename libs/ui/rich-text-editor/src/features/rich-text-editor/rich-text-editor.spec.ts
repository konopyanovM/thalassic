import { ComponentFixture, TestBed } from '@angular/core/testing';
import { markdownParser, markdownSerializer } from './rich-text-editor.markdown';
import { RichTextEditor } from './rich-text-editor';

describe('RichTextEditor', () => {
  let component: RichTextEditor;
  let fixture: ComponentFixture<RichTextEditor>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RichTextEditor],
    }).compileComponents();

    fixture = TestBed.createComponent(RichTextEditor);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('renders the editable textbox surface', () => {
    const textbox: HTMLElement | null = fixture.nativeElement.querySelector('[role="textbox"]');
    expect(textbox).not.toBeNull();
    if (!textbox) return;
    expect(textbox.getAttribute('aria-multiline')).toBe('true');
  });

  it('renders a formatting toolbar with controls', () => {
    const buttons = fixture.nativeElement.querySelectorAll('.tls-rich-text-editor__button');
    expect(buttons.length).toBeGreaterThan(0);
  });

  it('reflects invalid state onto the host group', async () => {
    fixture.componentRef.setInput('invalid', true);
    await fixture.whenStable();
    expect(fixture.nativeElement.getAttribute('aria-invalid')).toBe('true');
  });

  it('applies every external value write, including reverting to an earlier value', async () => {
    const textbox: HTMLElement = fixture.nativeElement.querySelector('[role="textbox"]');

    fixture.componentRef.setInput('value', 'hello');
    await fixture.whenStable();
    expect(textbox.textContent).toContain('hello');

    fixture.componentRef.setInput('value', '');
    await fixture.whenStable();
    expect(textbox.textContent).not.toContain('hello');

    fixture.componentRef.setInput('value', 'hello');
    await fixture.whenStable();
    expect(textbox.textContent).toContain('hello');
  });

  it('keeps a single tab stop in the toolbar', async () => {
    await fixture.whenStable();

    const buttons: NodeListOf<HTMLButtonElement> = fixture.nativeElement.querySelectorAll(
      '.tls-rich-text-editor__button',
    );
    const tabStops = Array.from(buttons).filter(button => button.tabIndex === 0);
    expect(tabStops.length).toBe(1);
  });

  it('round-trips Markdown through the parser and serializer', () => {
    const markdown = 'A **bold** and ~~struck~~ line.';
    const serialized = markdownSerializer.serialize(markdownParser.parse(markdown));
    expect(serialized).toContain('**bold**');
    expect(serialized).toContain('~~struck~~');
  });
});
