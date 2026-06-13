import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { ApiResponse } from '../../models/api-response.model';
import { Skill } from '../../models/skill.model';

@Injectable({
  providedIn: 'root'
})
export class AdminSkillService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/skills`;

  getSkills(): Observable<ApiResponse<Skill[]>> {
    return this.http.get<ApiResponse<Skill[]>>(
      `${this.apiUrl}`,
      { withCredentials: true }
    );
  }

  createSkill(skill: Partial<Skill>): Observable<ApiResponse<Skill>> {
    return this.http.post<ApiResponse<Skill>>(
      `${this.apiUrl}`,
      skill,
      { withCredentials: true }
    );
  }

  updateSkill(id: string, skill: Partial<Skill>): Observable<ApiResponse<Skill>> {
    return this.http.put<ApiResponse<Skill>>(
      `${this.apiUrl}/${id}`,
      skill,
      { withCredentials: true }
    );
  }

  deleteSkill(id: string): Observable<ApiResponse<void>> {
    return this.http.delete<ApiResponse<void>>(
      `${this.apiUrl}/${id}`,
      { withCredentials: true }
    );
  }
}