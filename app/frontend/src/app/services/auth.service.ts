import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { Router } from '@angular/router';
import { AnyARecord } from 'dns';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  private baseUrl = environment.apiUrl + '/api';

  constructor(private http: HttpClient, private router: Router) {}

  register(userData: any): Observable<any> {
    return this.http.post(`${this.baseUrl}/create-user`, userData);
  }

  login(credentials: { email: string; password: string }): Observable<any> {
    return this.http.post<any>(`${this.baseUrl}/login`, credentials);
  }

  isLoggedIn(): boolean {
    if (typeof localStorage !== 'undefined') {
      const token = localStorage.getItem('auth_token');
      return !!token; // Vraća true ako postoji token
    }
    return false; // Ako localStorage nije dostupan
  }

  logout(): void {
    localStorage.removeItem('auth_token');
    this.router.navigate(['/login']);
  }

  getUserData(): Observable<any> {
    return this.http.get(`${this.baseUrl}/user`);
  }

  updateUserProfile(userData: FormData): Observable<any> {
    return this.http.post(`${this.baseUrl}/update-user`, userData);
  }

}
