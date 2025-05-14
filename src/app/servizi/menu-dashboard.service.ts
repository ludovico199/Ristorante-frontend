import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Ordine {
  id: number;
  nr_ordine: string;
  tavolo_id: number;
  stato_ordine_id: number;
  nr_coperti: number;
  totale_prezzo: number;
  totale_items: string;   // JSON-encoded array of items
  created_at: string;
  updated_at?: string;
}

@Injectable({
  providedIn: 'root'
})
export class MenuDashboardService {
  private apiUrl       = 'http://localhost:8000/api/menu';
  private tipologieUrl = 'http://localhost:8000/api/tipologie';
  private tavoliUrl    = 'http://localhost:8000/api/tavoli';
  private tuttiOrdiniUrl = 'http://localhost:8000/api/tutti-gli-ordini';
  private ordiniBaseUrl  = 'http://localhost:8000/api/ordini';
  private cronologiaUrl  = 'http://localhost:8000/api/cronologia-ordini';

  constructor(private http: HttpClient) {}

  // --- MENU ---
  getMenu(): Observable<any[]> {
    return this.http.get<any[]>(this.apiUrl);
  }

  getMenuItem(id: number): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/${id}`);
  }

  addMenuItem(menuItem: { nome: string; prezzo: number; tipologia_id: number | null }): Observable<any> {
    return this.http.post<any>(this.apiUrl, menuItem);
  }

  updateMenuItem(id: number, menuItem: { nome?: string; prezzo?: number; tipologia_id?: number }): Observable<any> {
    return this.http.put<any>(`${this.apiUrl}/${id}`, menuItem);
  }

  deleteMenuItem(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`);
  }

  // --- TIPOLOGIE ---
  getTipologie(): Observable<any[]> {
    return this.http.get<any[]>(this.tipologieUrl);
  }

  addTipologia(tipologia: { descrittivo: string; colore: string; cucina: boolean }): Observable<any> {
    return this.http.post<any>(this.tipologieUrl, tipologia);
  }

  updateTipologia(id: number, tipologia: { descrittivo: string; colore: string; cucina: boolean }): Observable<any> {
    return this.http.put<any>(`${this.tipologieUrl}/${id}`, tipologia);
  }

  deleteTipologia(id: number): Observable<any> {
    return this.http.delete<any>(`${this.tipologieUrl}/${id}`);
  }

  // --- TAVOLI ---
  getTavoli(): Observable<any[]> {
    return this.http.get<any[]>(this.tavoliUrl);
  }

  addTavolo(tavolo: { numero_tavolo: number }): Observable<any> {
    return this.http.post<any>(this.tavoliUrl, tavolo);
  }

  updateTavolo(id: number, tavolo: { numero_tavolo: number }): Observable<any> {
    return this.http.put<any>(`${this.tavoliUrl}/${id}`, tavolo);
  }

  deleteTavolo(id: number): Observable<any> {
    return this.http.delete<any>(`${this.tavoliUrl}/${id}`);
  }


  // --- ORDINI ---
  getTuttiGliOrdini(): Observable<Ordine[]> {
    return this.http.get<Ordine[]>(this.tuttiOrdiniUrl);
  }

  chiudiOrdine(id: number): Observable<any> {
    return this.http.put(`${this.ordiniBaseUrl}/${id}/chiudi`, {});
  }

  /** Recupera la cronologia di **tutti** gli ordini, senza filtri di stato */
  getCronologiaOrdini(): Observable<Ordine[]> {
    return this.http.get<Ordine[]>(this.cronologiaUrl);
  }
}

