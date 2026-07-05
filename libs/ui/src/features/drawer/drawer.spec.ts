import { TestBed } from '@angular/core/testing';
import { DrawerService } from './drawer.service';

describe('DrawerService', () => {
  let service: DrawerService;

  beforeEach(async () => {
    await TestBed.configureTestingModule({}).compileComponents();
    service = TestBed.inject(DrawerService);
  });

  it('should create', () => {
    expect(service).toBeTruthy();
  });
});
