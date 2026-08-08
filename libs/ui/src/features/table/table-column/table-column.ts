import {
  booleanAttribute,
  Component,
  contentChild,
  input,
  InputSignalWithTransform,
  TemplateRef,
} from '@angular/core';
import { tableColumnAlignment, tableColumnCollapse } from '../table.types';

@Component({
  selector: 'tls-table-column',
  imports: [],
  template: '',
})
export class TableColumn {
  public readonly key = input.required<string>();
  public readonly header = input<string>();
  public readonly hidden: InputSignalWithTransform<boolean, unknown> = input<boolean, unknown>(
    false,
    { transform: booleanAttribute },
  );
  public readonly alignment = input<tableColumnAlignment>();
  public readonly width = input<number>();
  public readonly collapse = input<tableColumnCollapse>();

  public readonly template = contentChild(TemplateRef);
}
