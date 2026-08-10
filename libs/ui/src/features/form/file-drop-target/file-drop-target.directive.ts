import {
  booleanAttribute,
  Directive,
  input,
  InputSignalWithTransform,
  output,
  OutputEmitterRef,
  signal,
  Signal,
} from '@angular/core';
import { acceptsFile, isTypeRejected, normalizeAccept } from './accepts-file';
import { acceptInput, fileDragState } from './file-drop-target.types';

/**
 * Turns any element into a target files can be dragged onto, and nothing more:
 * no role, no focus behaviour, no styling of its own. What the target looks
 * like, and how else a file reaches it, stay with the host — which is what lets
 * a picture, a card or a whole page accept a drop without first having to look
 * like a drop zone.
 *
 * The drag is reported as it happens through `dragState` (read it via
 * `exportAs`), and `dropEffect` is set so the cursor answers before the drop.
 * Only files the `accept` rule set admits are emitted; a drop holding none of
 * them emits nothing.
 *
 * @example
 * ```html
 * <div [tlsFileDropTarget]="'image/*'"
 *      (filesDropped)="onFiles($event)"
 *      #drop="tlsFileDropTarget"
 *      [class.is-inviting]="drop.dragState() === 'valid'"></div>
 * ```
 */
@Directive({
  selector: '[tlsFileDropTarget]',
  exportAs: 'tlsFileDropTarget',
  host: {
    '(dragenter)': 'onDragEnter()',
    '(dragover)': 'onDragOver($event)',
    '(dragleave)': 'onDragLeave()',
    '(drop)': 'onDrop($event)',
  },
})
export class FileDropTargetDirective {
  // Inputs
  public readonly accept: InputSignalWithTransform<string, acceptInput> = input<
    string,
    acceptInput
  >('', { alias: 'tlsFileDropTarget', transform: normalizeAccept });
  public readonly disabled: InputSignalWithTransform<boolean, unknown> = input<boolean, unknown>(
    false,
    { transform: booleanAttribute },
  );

  // Outputs
  /** The dropped files the rule set admits, in the order they were dropped. */
  public readonly filesDropped: OutputEmitterRef<File[]> = output<File[]>();

  // State
  private readonly _dragState = signal<fileDragState>('idle');

  /** What the drag hovering the host holds, for the host to style itself by. */
  public readonly dragState: Signal<fileDragState> = this._dragState.asReadonly();

  /** Nesting depth of the active drag: dragenter/dragleave pairs fired by the host's children. */
  private _dragDepth = 0;

  // Protected methods
  protected onDragEnter(): void {
    this._dragDepth++;
  }

  protected onDragOver(event: DragEvent): void {
    // Without this the browser handles the drop itself, navigating to the file.
    event.preventDefault();
    if (!event.dataTransfer) return;

    // A target that takes nothing says so through the cursor, rather than
    // inviting a drop it would then swallow.
    if (this.disabled()) {
      event.dataTransfer.dropEffect = 'none';
      return;
    }

    const accept = this.accept();
    const draggedFiles = Array.from(event.dataTransfer.items).filter(item => item.kind === 'file');
    const rejected = draggedFiles.some(item => isTypeRejected(item.type, accept));

    event.dataTransfer.dropEffect = rejected ? 'none' : 'copy';
    this._dragState.set(rejected ? 'invalid' : 'valid');
  }

  // `dragleave` also fires when the pointer crosses onto a child of the host;
  // only a leave that balances every enter means the drag actually left.
  protected onDragLeave(): void {
    this._dragDepth = Math.max(0, this._dragDepth - 1);
    if (this._dragDepth === 0) this._dragState.set('idle');
  }

  protected onDrop(event: DragEvent): void {
    event.preventDefault();
    this._dragDepth = 0;
    this._dragState.set('idle');
    if (this.disabled() || !event.dataTransfer) return;

    const accept = this.accept();
    const accepted = Array.from(event.dataTransfer.files).filter(file => acceptsFile(file, accept));
    if (!accepted.length) return;

    this.filesDropped.emit(accepted);
  }
}
