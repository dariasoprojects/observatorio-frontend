import { TestBed } from '@angular/core/testing';

import { CultivosPermanenteService } from './cultivos-permanente.service';

describe('CultivosPermanenteService', () => {
  let service: CultivosPermanenteService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(CultivosPermanenteService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
