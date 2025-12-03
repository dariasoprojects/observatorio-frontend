import { TestBed } from '@angular/core/testing';

import { AnalisisGeometricoService } from './analisis-geometrico.service';

describe('AnalisisGeometricoService', () => {
  let service: AnalisisGeometricoService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(AnalisisGeometricoService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
