import { TestBed } from '@angular/core/testing';

import { CultivosTransitoriosService } from './cultivos-transitorios.service';

describe('CultivosTransitoriosService', () => {
  let service: CultivosTransitoriosService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(CultivosTransitoriosService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
