import { TestBed } from '@angular/core/testing';

import { BienesRecibidosService } from './bienes-recibidos.service';

describe('BienesRecibidosService', () => {
  let service: BienesRecibidosService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(BienesRecibidosService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
