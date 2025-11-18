import { TestBed } from '@angular/core/testing';

import { FiltroUbigeoService } from './filtro-ubigeo.service';

describe('FiltroUbigeoService', () => {
  let service: FiltroUbigeoService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(FiltroUbigeoService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
