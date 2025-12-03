import { TestBed } from '@angular/core/testing';

import { SumatoriasService } from './sumatorias.service';

describe('SumatoriasService', () => {
  let service: SumatoriasService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(SumatoriasService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
