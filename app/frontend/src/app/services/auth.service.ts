import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
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

  isAdmin(): boolean {
    const role = localStorage.getItem('role');
    return role === 'admin';
  }
  
  isUser(): boolean {
    const role = localStorage.getItem('role');
    return role === 'user';
  }

  logout(): void {
    localStorage.removeItem('auth_token');
    this.router.navigate(['/login']);
  }

  getUserData(): Observable<any> {
    return this.http.get(`${this.baseUrl}/user`);
  }

  getUserId(): Observable<any> {
    return this.http.get(`${this.baseUrl}/user-id`);
  }

  getUserByNickname(nickname: string): Observable<any> {
    const params = new HttpParams().set('nickname', nickname);
  
    return this.http.get(`${this.baseUrl}/search-users`, { params });
  }

  updateUserProfile(userData: FormData): Observable<any> {
    return this.http.post(`${this.baseUrl}/update-user`, userData);
  }

  //Zahtevi za prijateljstvo
  sendFriendRequest(receiverId: number): Observable<any> {
    return this.http.post(`${this.baseUrl}/send-friend-request`, { receiver_id: receiverId });
  }
  
  acceptFriendRequest(requestId: number): Observable<any> {
    return this.http.post(`${this.baseUrl}/accept-friend-request`, { request_id: requestId });
  }
  
  rejectFriendRequest(requestId: number): Observable<any> {
    return this.http.post(`${this.baseUrl}/reject-friend-request`, { request_id: requestId });
  }

  getFriendRequests(): Observable<any> {
    return this.http.get(`${this.baseUrl}/friend-requests`);
  }
  //

  sendResetEmail(email: string): Observable<any> {
    return this.http.post(`${this.baseUrl}/forgot-password`, { email });
  }

  resetPassword(data: any): Observable<any> {
    return this.http.post(`${this.baseUrl}/reset-password`, data);
  }  

}
