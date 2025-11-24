import { TestBed } from '@angular/core/testing';

import { ConsultaMultipleService } from './consulta-multiple.service';

describe('ConsultaMultipleService', () => {
  let service: ConsultaMultipleService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ConsultaMultipleService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
