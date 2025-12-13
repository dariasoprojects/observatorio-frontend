import { TestBed } from '@angular/core/testing';

import { ServiciosRecibidosService } from './servicios-recibidos.service';

describe('ServiciosRecibidosService', () => {
  let service: ServiciosRecibidosService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ServiciosRecibidosService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
