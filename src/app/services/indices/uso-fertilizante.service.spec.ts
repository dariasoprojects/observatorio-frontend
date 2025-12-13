import { TestBed } from '@angular/core/testing';

import { UsoFertilizanteService } from './uso-fertilizante.service';

describe('UsoFertilizanteService', () => {
  let service: UsoFertilizanteService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(UsoFertilizanteService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
