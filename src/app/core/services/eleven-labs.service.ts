import { inject, Injectable, Inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class ElevenLabsService {
  private apiUrl = 'https://llamaloiabackend.onrender.com/elevenLabs';
  private http = inject(HttpClient);
  private isBrowser: boolean;

  constructor(@Inject(PLATFORM_ID) platformId: Object) {
    this.isBrowser = isPlatformBrowser(platformId);
  }

  private getAuthHeaders(): HttpHeaders {
    let token = '';
    if (this.isBrowser) {
      token = localStorage.getItem('token') || '';
    }
    return new HttpHeaders({
      'Content-Type': 'application/json',
      Accept: '*/*',
      Authorization: `Bearer ${token}`,
    });
  }

  setFirstInteraction(message: string): Observable<any> {
    return this.http.post<any>(
      `${this.apiUrl}/setFirstInteraction`,
      JSON.stringify(message),
      {
        headers: this.getAuthHeaders(),
        responseType: 'json',
      }
    );
  }
}
