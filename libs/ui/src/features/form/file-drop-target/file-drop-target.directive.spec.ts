import { Component, signal, viewChild } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { acceptsFile, isTypeRejected, normalizeAccept } from './accepts-file';
import { FileDropTargetDirective } from './file-drop-target.directive';

const imageFile = (name = 'photo.png', type = 'image/png'): File =>
  new File([new Uint8Array([0])], name, { type });

describe('normalizeAccept', () => {
  it('joins the parts of a rule set into the attribute format', () => {
    expect(normalizeAccept(['image/png', 'image/jpeg'])).toBe('image/png,image/jpeg');
  });

  it('passes an already-joined rule set through', () => {
    expect(normalizeAccept('image/*')).toBe('image/*');
  });
});

describe('acceptsFile', () => {
  it('accepts anything when no rule set is given', () => {
    expect(acceptsFile(imageFile('notes.txt', 'text/plain'), '')).toBe(true);
  });

  it('matches an exact type', () => {
    expect(acceptsFile(imageFile(), 'image/png')).toBe(true);
    expect(acceptsFile(imageFile('photo.jpg', 'image/jpeg'), 'image/png')).toBe(false);
  });

  it('matches a wildcard type', () => {
    expect(acceptsFile(imageFile(), 'image/*')).toBe(true);
    expect(acceptsFile(imageFile('notes.txt', 'text/plain'), 'image/*')).toBe(false);
  });

  it('matches an extension rule by name, whatever the type says', () => {
    expect(acceptsFile(imageFile('photo.PNG', ''), '.png')).toBe(true);
    expect(acceptsFile(imageFile('photo.gif', 'image/gif'), '.png')).toBe(false);
  });
});

describe('isTypeRejected', () => {
  it('refuses a type no rule admits', () => {
    expect(isTypeRejected('text/plain', 'image/*')).toBe(true);
  });

  it('admits a type a rule matches', () => {
    expect(isTypeRejected('image/png', 'image/*,application/pdf')).toBe(false);
  });

  // A drag exposes types and nothing else, so these cannot be judged yet —
  // and refusing what cannot be judged would reject a legitimate drop.
  it('withholds judgement on an extension rule set', () => {
    expect(isTypeRejected('application/octet-stream', '.png')).toBe(false);
  });

  it('withholds judgement when the drag reports no type', () => {
    expect(isTypeRejected('', 'image/*')).toBe(false);
  });
});

@Component({
  imports: [FileDropTargetDirective],
  template: `<div
    #target="tlsFileDropTarget"
    [tlsFileDropTarget]="accept()"
    [disabled]="disabled()"
    (filesDropped)="dropped.set($event)"
  ></div>`,
})
class HostComponent {
  readonly accept = signal<string>('image/*');
  readonly disabled = signal<boolean>(false);
  readonly dropped = signal<File[] | null>(null);
  readonly target = viewChild.required(FileDropTargetDirective);
}

describe('FileDropTargetDirective', () => {
  let fixture: ComponentFixture<HostComponent>;
  let host: HostComponent;
  let element: HTMLElement;

  // A DataTransfer stand-in: jsdom builds no drag events of its own.
  const dragEvent = (type: string, files: File[]): DragEvent => {
    const event = new Event(type, { bubbles: true, cancelable: true }) as DragEvent;
    Object.defineProperty(event, 'dataTransfer', {
      value: {
        dropEffect: 'none',
        files,
        items: files.map(file => ({ kind: 'file', type: file.type })),
      },
    });

    return event;
  };

  const fire = (type: string, files: File[] = []): DragEvent => {
    const event = dragEvent(type, files);
    element.dispatchEvent(event);
    fixture.detectChanges();

    return event;
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({ imports: [HostComponent] }).compileComponents();

    fixture = TestBed.createComponent(HostComponent);
    host = fixture.componentInstance;
    element = fixture.nativeElement.querySelector('div');
    fixture.detectChanges();
  });

  it('reports a drag it would accept, and the cursor to match', () => {
    fire('dragenter');
    const over = fire('dragover', [imageFile()]);

    expect(host.target().dragState()).toBe('valid');
    expect(over.dataTransfer?.dropEffect).toBe('copy');
  });

  it('reports a drag it would refuse', () => {
    fire('dragenter');
    const over = fire('dragover', [imageFile('notes.txt', 'text/plain')]);

    expect(host.target().dragState()).toBe('invalid');
    expect(over.dataTransfer?.dropEffect).toBe('none');
  });

  // Crossing onto a child fires `dragleave` on the host without the drag having
  // gone anywhere; only a leave balancing every enter ends it.
  it('holds the drag across a child boundary', () => {
    fire('dragenter');
    fire('dragover', [imageFile()]);
    fire('dragenter');
    fire('dragleave');

    expect(host.target().dragState()).toBe('valid');

    fire('dragleave');

    expect(host.target().dragState()).toBe('idle');
  });

  it('emits the accepted files on drop and settles', () => {
    fire('dragenter');
    fire('dragover', [imageFile()]);
    fire('drop', [imageFile('a.png'), imageFile('notes.txt', 'text/plain')]);

    expect(host.dropped()?.map(file => file.name)).toEqual(['a.png']);
    expect(host.target().dragState()).toBe('idle');
  });

  it('stays silent when a drop holds nothing it accepts', () => {
    fire('drop', [imageFile('notes.txt', 'text/plain')]);

    expect(host.dropped()).toBeNull();
  });

  it('takes nothing while disabled', () => {
    host.disabled.set(true);
    fixture.detectChanges();

    fire('dragenter');
    const over = fire('dragover', [imageFile()]);

    expect(host.target().dragState()).toBe('idle');
    expect(over.dataTransfer?.dropEffect).toBe('none');

    fire('drop', [imageFile()]);

    expect(host.dropped()).toBeNull();
  });

  // The browser navigates to a dropped file unless both events are cancelled.
  it('cancels the events the browser would otherwise handle itself', () => {
    expect(fire('dragover', [imageFile()]).defaultPrevented).toBe(true);
    expect(fire('drop', [imageFile()]).defaultPrevented).toBe(true);
  });
});
