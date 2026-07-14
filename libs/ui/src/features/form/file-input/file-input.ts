import { NgTemplateOutlet } from '@angular/common';
import {
  booleanAttribute,
  Component,
  computed,
  contentChild,
  ElementRef,
  forwardRef,
  inject,
  input,
  InputSignal,
  InputSignalWithTransform,
  model,
  ModelSignal,
  Signal,
  signal,
  TemplateRef,
  viewChild,
} from '@angular/core';
import { FORM_CONTROL, ValueFormControl } from '../../../abstract/form';
import { controlSize } from '../../../types';
import { ButtonDirective } from '../../button';
import { FILE_INPUT_CONFIG } from './file-input.token';
import {
  acceptInput,
  FileInputDropZoneContext,
  FileInputFileContext,
  fileInputDragState,
  fileInputVariant,
} from './file-input.types';

function normalizeAccept(value: acceptInput): string {
  return Array.isArray(value) ? value.join(',') : value;
}

@Component({
  selector: 'tls-file-input',
  templateUrl: './file-input.html',
  imports: [NgTemplateOutlet, ButtonDirective],
  providers: [{ provide: FORM_CONTROL, useExisting: forwardRef(() => FileInput) }],
  host: { '[class]': 'classes()' },
})
export class FileInput extends ValueFormControl<File[]> {
  // Injections
  private readonly _config = inject(FILE_INPUT_CONFIG);

  protected override CLASS_NAME = 'tls-file-input';

  // Inputs
  public readonly value: ModelSignal<File[]> = model<File[]>([]);
  public readonly variant: InputSignal<fileInputVariant> = input<fileInputVariant>(
    this._config.variant,
  );
  public readonly size: InputSignal<controlSize> = input<controlSize>(this._config.size);
  public readonly multiple: InputSignalWithTransform<boolean, unknown> = input<boolean, unknown>(
    this._config.multiple,
    { transform: booleanAttribute },
  );
  public readonly accept: InputSignalWithTransform<string, acceptInput> = input<
    string,
    acceptInput
  >(normalizeAccept(this._config.accept), { transform: normalizeAccept });
  public readonly fluid: InputSignalWithTransform<boolean, unknown> = input<boolean, unknown>(
    this._config.fluid,
    { transform: booleanAttribute },
  );
  public readonly hideFileList: InputSignalWithTransform<boolean, unknown> = input<
    boolean,
    unknown
  >(this._config.hideFileList, { transform: booleanAttribute });

  // State
  protected readonly nativeInput = viewChild.required<ElementRef<HTMLInputElement>>('nativeInput');
  protected readonly dragState = signal<fileInputDragState>('idle');

  protected readonly dropZoneTemplate =
    contentChild<TemplateRef<FileInputDropZoneContext>>('dropZone');
  protected readonly fileTemplate = contentChild<TemplateRef<FileInputFileContext>>('file');

  // Computed
  protected readonly classes: Signal<string[]> = computed(() => {
    const className = this.CLASS_NAME;
    const array = [className, `${className}--${this.variant()}`, `${className}--${this.size()}`];
    if (this.fluid()) array.push(`${className}--fluid`);
    return array.concat(this.controlClasses());
  });

  protected readonly triggerLabel: Signal<string> = computed(() =>
    this.multiple() ? 'Choose files' : 'Choose file',
  );

  protected readonly acceptHint: Signal<string> = computed(() => {
    const accept = this.accept().trim();
    if (!accept) return '';

    const labels = accept
      .split(',')
      .map(rule => rule.trim())
      .filter(Boolean)
      .map(rule => this._formatAcceptRule(rule));

    return [...new Set(labels)].join(', ');
  });

  // Protected methods
  protected openFilePicker(): void {
    if (this.notInteractive()) return;
    this.nativeInput().nativeElement.click();
  }

  protected onFilesSelected(event: Event): void {
    const target = event.target as HTMLInputElement;
    if (!target.files) return;
    this._addFiles(Array.from(target.files));
    target.value = '';
  }

  protected onDropZoneKeydown(event: KeyboardEvent): void {
    if (event.key !== 'Enter' && event.key !== ' ') return;
    event.preventDefault();
    this.openFilePicker();
  }

  protected onDragOver(event: DragEvent): void {
    event.preventDefault();
    if (this.notInteractive() || !event.dataTransfer) return;

    const draggedItems = Array.from(event.dataTransfer.items).filter(item => item.kind === 'file');
    const rejected = draggedItems.some(item => this._isTypeRejected(item.type));

    event.dataTransfer.dropEffect = rejected ? 'none' : 'copy';
    this.dragState.set(rejected ? 'invalid' : 'valid');
  }

  protected onDragLeave(): void {
    this.dragState.set('idle');
  }

  protected onDrop(event: DragEvent): void {
    event.preventDefault();
    this.dragState.set('idle');
    if (this.notInteractive() || !event.dataTransfer) return;
    this._addFiles(Array.from(event.dataTransfer.files));
  }

  // Arrow function so it keeps `this` when passed through a custom file template context.
  protected readonly removeFile = (fileIndex: number): void => {
    if (this.notInteractive()) return;
    this.value.update(files => files.filter((_file, index) => index !== fileIndex));
  };

  // Private methods
  private _addFiles(incoming: File[]): void {
    const accepted = incoming.filter(file => this._acceptsFile(file));
    if (!accepted.length) return;

    this.touched.set(true);
    if (this.multiple()) {
      this.value.update(files => [...files, ...accepted]);
    } else {
      this.value.set(accepted.slice(0, 1));
    }
  }

  private _acceptsFile(file: File): boolean {
    const accept = this.accept().trim();
    if (!accept) return true;

    const fileName = file.name.toLowerCase();
    const fileType = file.type.toLowerCase();

    return accept.split(',').some(rule => {
      const pattern = rule.trim().toLowerCase();
      if (!pattern) return false;
      if (pattern.startsWith('.')) return fileName.endsWith(pattern);
      if (pattern.endsWith('/*')) return fileType.startsWith(pattern.slice(0, -1));
      return fileType === pattern;
    });
  }

  private _formatAcceptRule(rule: string): string {
    if (rule.startsWith('.')) return rule.slice(1).toUpperCase();

    if (rule.endsWith('/*')) {
      const category = rule.slice(0, -2);
      const categoryLabels: Record<string, string> = {
        image: 'Images',
        video: 'Videos',
        audio: 'Audio',
      };
      if (category in categoryLabels) return categoryLabels[category];
      return `${category.charAt(0).toUpperCase()}${category.slice(1)}`;
    }

    const subtype = rule.includes('/') ? rule.slice(rule.indexOf('/') + 1) : rule;
    return subtype.toUpperCase();
  }

  // Drag-time check: only the MIME type is exposed before drop, so reject a
  // dragged file only when we can be certain it fails purely MIME-based rules.
  private _isTypeRejected(type: string): boolean {
    const accept = this.accept().trim();
    if (!accept) return false;

    const rules = accept
      .split(',')
      .map(rule => rule.trim().toLowerCase())
      .filter(Boolean);

    const hasExtensionRule = rules.some(rule => rule.startsWith('.'));
    if (hasExtensionRule || !type) return false;

    const fileType = type.toLowerCase();
    const matches = rules.some(rule =>
      rule.endsWith('/*') ? fileType.startsWith(rule.slice(0, -1)) : fileType === rule,
    );

    return !matches;
  }
}
