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
  TemplateRef,
  viewChild,
} from '@angular/core';
import { FORM_CONTROL, ValueFormControl } from '../../../abstract/form';
import { controlSize } from '../../../types';
import { ButtonDirective } from '../../button';
import {
  acceptInput,
  acceptsFile,
  FileDropTargetDirective,
  normalizeAccept,
} from '../file-drop-target';
import { FILE_INPUT_CONFIG } from './file-input.token';
import {
  FileInputDropZoneContext,
  FileInputFileContext,
  fileInputVariant,
} from './file-input.types';

@Component({
  selector: 'tls-file-input',
  templateUrl: './file-input.html',
  imports: [NgTemplateOutlet, ButtonDirective, FileDropTargetDirective],
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
    this.multiple() ? this._config.chooseFilesLabel : this._config.chooseFileLabel,
  );

  /** Accessible name for the drop zone: the consumer's, or the configured fallback. */
  protected readonly dropZoneLabel: Signal<string> = computed(() => {
    const consumerLabel = this.ariaLabel();
    if (consumerLabel) return consumerLabel;
    return this.multiple() ? this._config.dropZoneFilesLabel : this._config.dropZoneFileLabel;
  });

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
    this.addFiles(Array.from(target.files));
    target.value = '';
  }

  protected onDropZoneKeydown(event: KeyboardEvent): void {
    if (event.key !== 'Enter' && event.key !== ' ') return;
    event.preventDefault();
    this.openFilePicker();
  }

  // Arrow function so it keeps `this` when passed through a custom file template context.
  protected readonly removeFile = (fileIndex: number): void => {
    if (this.notInteractive()) return;
    this.value.update(files => files.filter((_file, index) => index !== fileIndex));
  };

  // Adds what the picker or a drop hands over, keeping only what is accepted.
  protected addFiles(incoming: File[]): void {
    const accepted = incoming.filter(file => acceptsFile(file, this.accept()));
    if (!accepted.length) return;

    this.touched.set(true);
    if (this.multiple()) {
      this.value.update(files => [...files, ...accepted]);
    } else {
      this.value.set(accepted.slice(0, 1));
    }
  }

  // Private methods
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
}
