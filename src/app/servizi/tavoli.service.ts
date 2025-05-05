import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class TavoloService {

  private apiUrl = 'http://localhost:8000/api/tavoli';

  constructor(private http: HttpClient) { }

  getTavoli(): Observable<any> {
    return this.http.get<any[]>(this.apiUrl);
  }

  // Getter pubblico per accedere a apiUrl
  public get url(): string {
    return this.apiUrl;
  }
}
