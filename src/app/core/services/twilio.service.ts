import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { TwilioConfig } from '../../shared/models/twilio-config.model';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class TwilioService {
  private http = inject(HttpClient);
  private apiUrl = 'https://localhost:7027/api/twilio';

  setConfig(config: TwilioConfig): Observable<any> {
    return this.http.post(`${this.apiUrl}/config`, config);
  }

  getInfo(): Observable<TwilioConfig> {
    return this.http.get<TwilioConfig>(`${this.apiUrl}/info`);
  }
}
