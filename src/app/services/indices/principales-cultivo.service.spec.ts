import { TestBed } from '@angular/core/testing';

import { PrincipalesCultivoService } from './principales-cultivo.service';

describe('PrincipalesCultivoService', () => {
  let service: PrincipalesCultivoService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(PrincipalesCultivoService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
