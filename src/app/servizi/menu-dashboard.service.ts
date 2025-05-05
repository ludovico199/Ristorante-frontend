import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators'; // Importa tap!

@Injectable({
  providedIn: 'root'
})
export class MenuDashboardService {
  private apiUrl = 'http://localhost:8000/api/menu';
  private tipologieUrl = 'http://localhost:8000/api/tipologie';

  constructor(private http: HttpClient) {}

  getMenu(): Observable<any[]> {
    return this.http.get<any[]>(this.apiUrl);
  }

  getMenuItem(id: number): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/${id}`);
  }

  deleteMenuItem(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`);
  }

  addMenuItem(menuItem: { nome: string, tipologia_id: number }): Observable<any> {
    return this.http.post<any>(this.apiUrl, menuItem);
  }

  updateMenuItem(id: number, menuItem: { nome?: string, prezzo?: number, tipologia_id?: number }): Observable<any> {
    return this.http.put<any>(`${this.apiUrl}/${id}`, menuItem);
  }

  getTipologie(): Observable<any[]> {
    return this.http.get<any[]>(this.tipologieUrl).pipe(
    );
  }
}
