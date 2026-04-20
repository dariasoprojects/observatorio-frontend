import { TestBed } from '@angular/core/testing';

import { TamanioParcelaService } from './tamanio-parcela.service';

describe('TamanioParcelaService', () => {
  let service: TamanioParcelaService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(TamanioParcelaService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
