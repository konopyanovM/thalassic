import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Table } from './table';
import { TableData } from './table.types';

describe('Table', () => {
  let component: Table<TableData>;
  let fixture: ComponentFixture<Table<TableData>>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Table],
    }).compileComponents();

    fixture = TestBed.createComponent<Table<TableData>>(Table);
    fixture.componentRef.setInput('data', []);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('scrollable', () => {
    const DATA = Array.from({ length: 50 }, (_, index) => ({ name: `Row ${index}` }));
    const COLUMNS = [{ key: 'name', header: 'Name' }];

    beforeEach(async () => {
      fixture.componentRef.setInput('data', DATA);
      fixture.componentRef.setInput('columnDefinitions', COLUMNS);
      await fixture.whenStable();
    });

    it('should not scroll or stick the header without a maxHeight', () => {
      const element: HTMLElement = fixture.nativeElement;

      expect(element.classList.contains('tls-table-container--scrollable')).toBe(false);
      expect(element.style.maxHeight).toBe('');
      expect(element.querySelector('.tls-table__header-cell.cdk-table-sticky')).toBeNull();
    });

    it('should turn the host into a bounded scroll container when maxHeight is set', async () => {
      fixture.componentRef.setInput('maxHeight', 240);
      await fixture.whenStable();

      const element: HTMLElement = fixture.nativeElement;
      expect(element.classList.contains('tls-table-container--scrollable')).toBe(true);
      expect(element.style.maxHeight).toBe('240px');
    });

    it('should stick the header row cells when scrollable', async () => {
      fixture.componentRef.setInput('maxHeight', 240);
      await fixture.whenStable();

      const headerCell = fixture.nativeElement.querySelector('.tls-table__header-cell');
      expect(headerCell?.classList.contains('cdk-table-sticky')).toBe(true);
    });

    it('should stick the header when maxHeight is set from the very first render', async () => {
      const freshFixture = TestBed.createComponent(Table);
      freshFixture.componentRef.setInput('data', DATA);
      freshFixture.componentRef.setInput('columnDefinitions', COLUMNS);
      freshFixture.componentRef.setInput('maxHeight', 240);
      await freshFixture.whenStable();

      const headerCell = freshFixture.nativeElement.querySelector('.tls-table__header-cell');
      expect(headerCell?.classList.contains('cdk-table-sticky')).toBe(true);
    });
  });

  describe('collapse', () => {
    const DATA = [{ name: 'Row', note: 'Note value', extra: 'Extra value' }];
    const COLUMNS = [
      { key: 'name', header: 'Name' },
      { key: 'note', header: 'Note', collapse: 'fold' as const },
      { key: 'extra', header: 'Extra', collapse: 'hide' as const },
    ];

    beforeEach(async () => {
      fixture.componentRef.setInput('data', DATA);
      fixture.componentRef.setInput('columnDefinitions', COLUMNS);
      await fixture.whenStable();
    });

    it('should not mark the host as collapsing when no collapse width is set', () => {
      const element: HTMLElement = fixture.nativeElement;
      expect(element.className).not.toContain('tls-table-container--collapse-');
    });

    it('should mark the host with the collapse width so the container query applies', async () => {
      fixture.componentRef.setInput('collapseAt', 'md');
      await fixture.whenStable();

      const element: HTMLElement = fixture.nativeElement;
      expect(element.classList.contains('tls-table-container--collapse-md')).toBe(true);
      expect(element.classList.contains('tls-table-container')).toBe(true);
    });

    it('should mark each cell with its collapse behaviour', () => {
      const cells = fixture.nativeElement.querySelectorAll('.tls-table__cell');

      expect(cells[0].classList.contains('tls-table__cell--fold')).toBe(false);
      expect(cells[1].classList.contains('tls-table__cell--fold')).toBe(true);
      expect(cells[2].classList.contains('tls-table__cell--hide')).toBe(true);
    });

    // A folded cell leaves the column grid, so the header has to travel with the value —
    // it is the only thing left to say what the value means.
    it('should carry the column header on the cell as its label', () => {
      const cells = fixture.nativeElement.querySelectorAll('.tls-table__cell');

      expect(cells[1].getAttribute('data-label')).toBe('Note');
    });

    it('should state table roles explicitly so a changed display cannot strip them', () => {
      const table = fixture.nativeElement.querySelector('table');
      const row = fixture.nativeElement.querySelector('.tls-table__row');
      const cell = fixture.nativeElement.querySelector('.tls-table__cell');

      expect(table?.getAttribute('role')).toBe('table');
      expect(row?.getAttribute('role')).toBe('row');
      expect(cell?.getAttribute('role')).toBe('cell');
    });
  });
});
