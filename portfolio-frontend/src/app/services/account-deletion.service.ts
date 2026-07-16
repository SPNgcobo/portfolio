import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { ApiResponse } from '../models/api-response.model';
import { DeleteAccountRequest } from '../models/delete-account-request.model';

@Injectable({
  providedIn: 'root'
})
export class AccountDeletionService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/auth`;

  deleteAccount(request: DeleteAccountRequest): Observable<ApiResponse<void>> {
    return this.http.delete<ApiResponse<void>>(
      `${this.apiUrl}/account`,
      {
        body: request,
        withCredentials: true
      }
    );
  }
}