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

  getUsersAdminFilter(nameFilter: string, surnameFilter: string, cityFilter: string, schoolFilter: string, winsFilter: number | null, lossesFilter: number | null, classFilter: number | null, mathGradeFilter: number | null, infoGradeFilter: number | null, userType: string ): Observable<any> {
    let params = new HttpParams();
  
    if (nameFilter) params = params.set('name', nameFilter);
    if (surnameFilter) params = params.set('surname', surnameFilter);
    if (cityFilter) params = params.set('city', cityFilter);
    if (schoolFilter) params = params.set('school', schoolFilter);
    if (winsFilter !== null && winsFilter !== undefined) params = params.set('wins', winsFilter.toString());
    if (lossesFilter !== null && lossesFilter !== undefined) params = params.set('losses', lossesFilter.toString());
    if (classFilter !== null && classFilter !== undefined) params = params.set('class', classFilter.toString());
    if (mathGradeFilter !== null && mathGradeFilter !== undefined) params = params.set('math_grade', mathGradeFilter.toString());
    if (infoGradeFilter !== null && infoGradeFilter !== undefined) params = params.set('info_grade', infoGradeFilter.toString());
    if (userType) params = params.set('user_type', userType);
  
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

  makeAdmin(userId: number): Observable<any> {
  return this.http.put(`${this.baseUrl}/make-admin/${userId}`, {});
  }

  deleteUser(userId: number): Observable<any> {
    return this.http.delete(`${this.baseUrl}/deleteUser/${userId}`);
  }
  
}
