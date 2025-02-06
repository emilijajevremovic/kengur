import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class TaskService {

  private baseUrl = environment.apiUrl;

  constructor(private http: HttpClient) { }

  getDistinctClassesMath(): Observable<string[]> {
    return this.http.get<string[]>(`${this.baseUrl}/distinct-classes`);
  }

}
