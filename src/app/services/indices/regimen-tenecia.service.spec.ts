import { TestBed } from '@angular/core/testing';

import { RegimenTeneciaService } from './regimen-tenecia.service';

describe('RegimenTeneciaService', () => {
  let service: RegimenTeneciaService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(RegimenTeneciaService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
