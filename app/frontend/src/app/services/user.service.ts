import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { environment } from '../../environments/environment';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class UserService {

  private baseUrl = environment.apiUrl + '/api';

  constructor(private http: HttpClient, private router: Router) { }

  getUsers(): Observable<any> {
    return this.http.get(`${this.baseUrl}/users`);
  }

  setUserOnline(): Observable<any> {
    return this.http.post(`${this.baseUrl}/set-online`, {}); 
  }

  setUserOffline(): Observable<any> {
    return this.http.post(`${this.baseUrl}/set-offline`, {});
  }
  
}
