import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { RouterModule } from '@angular/router';

interface Piatto {
  nome: string;
  pivot: {
    quantita: number;
    note?: string;
    comanda_id?: number;
  };
}

interface Ordine {
  id: number;
  tavolo_id: number;
  stato_ordine_id: number;
  menu: Piatto[];
  groupedMenu?: { [turno: string]: Piatto[] };
}

@Component({
  selector: 'app-cucina',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './cucina.component.html',
  styleUrls: ['./cucina.component.css']
})
export class CucinaComponent implements OnInit, OnDestroy {
  ordini: Ordine[] = [];
  private intervallo: any;

  constructor(private http: HttpClient) {}

  ngOnInit(): void {
    this.caricaOrdini();
    
    this.intervallo = setInterval(() => this.caricaOrdini(), 500000);
    
  }

  ngOnDestroy(): void {
    if (this.intervallo) clearInterval(this.intervallo);
  }

  private caricaOrdini(): void {
    this.http.get<Ordine[]>(`http://localhost:8000/api/tutti-gli-ordini`).subscribe({
      next: (response) => {
        // filtra ordine aperti
        this.ordini = response
          .filter(o => o.stato_ordine_id !== 2)
          .map(o => ({
            ...o,
            groupedMenu: this.groupByTurno(o.menu)
          }));
      },
      error: (error) => console.error('Errore nel caricamento degli ordini:', error)
    });
  }

  private groupByTurno(menu: Piatto[]): { [turno: string]: Piatto[] } {
    return menu.reduce((acc, piatto) => {
      const turno = piatto.pivot.comanda_id != null
        ? piatto.pivot.comanda_id.toString()
        : 'NO';
      (acc[turno] = acc[turno] || []).push(piatto);
      return acc;
    }, {} as { [turno: string]: Piatto[] });
  }

  getTurni(o: Ordine): string[] {
    return Object.keys(o.groupedMenu || {});
  }

  chiudiOrdine(ordineId: number): void {
    this.http.put(`http://localhost:8000/api/ordini/${ordineId}/chiudi`, {}).subscribe({
      next: () => this.caricaOrdini(),
      error: (err) => console.error(`Errore chiusura ordine ${ordineId}:`, err)
    });
  }
}
