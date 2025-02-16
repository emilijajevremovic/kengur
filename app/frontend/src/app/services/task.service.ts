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

  sendChallenge(challengeData: any): Observable<any> {
    return this.http.post(`${this.baseUrl}/api/send-challenge`, challengeData);
  }

  acceptChallenge(challengeData: any): Observable<any> {
    return this.http.post(`${this.baseUrl}/api/accept-challenge`, challengeData);
  }

  rejectChallenge(rejectionData: any): Observable<any> {
    return this.http.post(`${this.baseUrl}/api/reject-challenge`, rejectionData);
  }

  validateGameAccess(gameId: string): Observable<any> {
    return this.http.get(`${this.baseUrl}/api/game/${gameId}`);
  }

  assignTasksToGame(gameId: string, gameClass: string): Observable<any> {
    return this.http.post(`${this.baseUrl}/api/assign-tasks/${gameId}/${gameClass}`, {});
  }

  getGameTasks(gameId: string): Observable<any> {
    return this.http.get(`${this.baseUrl}/api/game/${gameId}/tasks`);
  }  

  checkAnswers(gameId: string, answersData: any) {
    return this.http.post(`${this.baseUrl}/api/check-answers/${gameId}`, answersData);
  }

  submitGameResult(resultData: any, gameId: string) {
    return this.http.post(`${this.baseUrl}/api/submit-game-result/${gameId}`, resultData);
  }

  getGameResults(gameId: string) {
    return this.http.get(`${this.baseUrl}/api/game-results/${gameId}`);
  }

  finishGame(gameId: string, resultData: any) {
    return this.http.post(`${this.baseUrl}/api/finish-game/${gameId}`, resultData);
  }

}
