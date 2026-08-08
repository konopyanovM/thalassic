import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Table } from './table';

describe('Table', () => {
  let component: Table;
  let fixture: ComponentFixture<Table>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Table],
    }).compileComponents();

    fixture = TestBed.createComponent(Table);
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
});
