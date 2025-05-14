import { Component, OnInit } from '@angular/core';
import { CommonModule, formatDate, registerLocaleData } from '@angular/common';
import localeIt from '@angular/common/locales/it';
import { HttpClientModule } from '@angular/common/http';
import { MenuDashboardService, Ordine } from '../../servizi/menu-dashboard.service';

// registra i formati italiani (se non già fatto globalmente)
registerLocaleData(localeIt, 'it-IT');

@Component({
  selector: 'app-ordini-dashboard',
  standalone: true,
  imports: [ CommonModule, HttpClientModule ],
  templateUrl: './ordini-dashboard.component.html',
  styleUrls: ['./ordini-dashboard.component.css']
})
export class OrdiniDashboardComponent implements OnInit {
  ordini: Ordine[] = [];
  expandedOrderId: number | null = null;
  parsedItems: Array<{ nome: string; quantita: number; prezzo: string }> = [];

  constructor(private svc: MenuDashboardService) {}

  ngOnInit(): void {
    this.loadOrdini();
  }

  /**
   * Carica la cronologia completa di tutti gli ordini,
   * utilizzando il nuovo endpoint /cronologia-ordini
   */
  loadOrdini(): void {
    this.svc.getCronologiaOrdini().subscribe({
      next: data => {
        console.log('CRONOLOGIA ORDINI RICEVUTA DAL SERVER:', data);
        this.ordini = data;
      },
      error: err => console.error('Errore caricamento cronologia ordini:', err)
    });
  }

  /**
   * Espande/nasconde i dettagli dei singoli items di un ordine
   */
  toggleDetails(o: Ordine): void {
    if (this.expandedOrderId === o.id) {
      this.expandedOrderId = null;
      this.parsedItems = [];
    } else {
      this.expandedOrderId = o.id;
      try {
        this.parsedItems = JSON.parse(o.totale_items);
      } catch {
        this.parsedItems = [];
      }
    }
  }

  /**
   * Chiude l'ordine (stato -> 2), mantenendo il pulsante "Cancella" se serve
   */
  rimuoviOrdine(id: number, event: MouseEvent): void {
    event.stopPropagation();
    this.svc.chiudiOrdine(id).subscribe({
      next: () => this.loadOrdini(),
      error: err => console.error('Errore chiusura ordine:', err)
    });
  }

  /**
   * Restituisce una data italiana leggibile
   */
  formatDateTime(iso: string): string {
    return formatDate(iso, 'dd/MM/yyyy, HH:mm', 'it-IT');
  }
}
