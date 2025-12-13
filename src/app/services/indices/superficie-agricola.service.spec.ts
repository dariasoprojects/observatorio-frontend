import { TestBed } from '@angular/core/testing';

import { SuperficieAgricolaService } from './superficie-agricola.service';

describe('SuperficieAgricolaService', () => {
  let service: SuperficieAgricolaService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(SuperficieAgricolaService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
