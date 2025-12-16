import { TestBed } from '@angular/core/testing';

import { RegionNaturalService } from './region-natural.service';

describe('RegionNaturalService', () => {
  let service: RegionNaturalService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(RegionNaturalService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
