import { HttpClient, HttpHeaders, HttpParams  } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { environment } from '../../environments/environment';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class UserService {
  public baseUrl = environment.apiUrl + '/api';

  constructor(private http: HttpClient, private router: Router) {}

  getUsers(): Observable<any> {
    return this.http.get(`${this.baseUrl}/users`);
  }

  setUserOnline(): Observable<any> {
    return this.http.post(`${this.baseUrl}/set-online`, {});
  }

  setUserOffline(token: any): Observable<any> {
    return this.http.post(`${this.baseUrl}/set-offline`, { token });
  }

  getOnlineUsers(): Observable<any> {
    return this.http.get(`${this.baseUrl}/online-users`);
  }

  getInGameUsers(): Observable<any> {
    return this.http.get(`${this.baseUrl}/in-game-users`);
  }

  pingUser(): Observable<any> {
    return this.http.post(`${this.baseUrl}/ping`, {});
  }

  getFriends(): Observable<any> {
    return this.http.get<any>(`${this.baseUrl}/friends`);
  }

  updateStats(result: 'win' | 'loss'): Observable<any> {
    return this.http.post(`${this.baseUrl}/user/update-result`, { result });
  }

  getUsersAdmin(): Observable<any> {
    return this.http.get<any>(`${this.baseUrl}/users-admin`);
  }

  getUsersAdminFilter(nameFilter: string, surnameFilter: string, schoolFilter: string, winsFilter: number, lossesFilter: number): Observable<any> {

    const params = new HttpParams()
      .set('name', nameFilter)
      .set('surname', surnameFilter)
      .set('school', schoolFilter)
      .set('wins', winsFilter ? winsFilter.toString() : '')
      .set('losses', lossesFilter ? lossesFilter.toString() : '');
  
    return this.http.get<any>(`${this.baseUrl}/users-admin`, { params });
  }
  
  exportUsers(nameFilter: string, surnameFilter: string, schoolFilter: string, winsFilter: number, lossesFilter: number): Observable<Blob> {
    const params = new HttpParams()
      .set('name', nameFilter)
      .set('surname', surnameFilter)
      .set('school', schoolFilter)
      .set('wins', winsFilter ? winsFilter.toString() : '')
      .set('losses', lossesFilter ? lossesFilter.toString() : '');

    return this.http.get<Blob>(`${this.baseUrl}/users-export`, { params, responseType: 'blob' as 'json' });
  }
  
}
