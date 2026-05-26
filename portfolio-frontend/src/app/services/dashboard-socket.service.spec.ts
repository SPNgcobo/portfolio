import { TestBed } from '@angular/core/testing';

import { DashboardSocketService } from './dashboard-socket.service';

describe('DashboardSocketService', () => {
  let service: DashboardSocketService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(DashboardSocketService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
