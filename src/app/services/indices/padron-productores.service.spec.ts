import { TestBed } from '@angular/core/testing';

import { PadronProductoresService } from './padron-productores.service';

describe('PadronProductoresService', () => {
  let service: PadronProductoresService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(PadronProductoresService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
