import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MenuDashboardService } from '../../servizi/menu-dashboard.service';

@Component({
  selector: 'app-menu-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './menu-dashboard.component.html',
  styleUrls: ['./menu-dashboard.component.css']
})
export class MenuDashboardComponent implements OnInit {
  menuItems: any[] = [];
  tipologie: any[] = [];
  mostraFormAggiunta = false;
  selectedItem: any = null;

  // *** variabili per la ricerca ***
  searchTerm: string = '';
  filteredItems: any[] = [];
  ricercaAttiva: boolean = false;

  nuovaVoce = {
    nome: '',
    prezzo: 0,
    quantita: 0,
    tipologia_id: null as number | null
  };

  constructor(private menuDashboardService: MenuDashboardService) {}

  ngOnInit(): void {
    this.getTipologie();
  }

  getTipologie(): void {
    this.menuDashboardService.getTipologie().subscribe({
      next: data => {
        this.tipologie = data;
        this.getMenu();
      },
      error: err => console.error('Errore nel recupero tipologie:', err)
    });
  }

  getMenu(): void {
    this.menuDashboardService.getMenu().subscribe({
      next: data => {
        this.menuItems = data.map(item => {
          const tipo = this.tipologie.find(t => t.id === item.tipologia_id);
          return {
            ...item,
            tipologia: tipo?.descrittivo,
            quantita: item.quantita
          };
        });
        // se la ricerca era attiva, ri-filtra i nuovi dati
        if (this.ricercaAttiva) {
          this.cercaMenu();
        }
      },
      error: err => console.error('Errore nel recupero menu:', err)
    });
  }

  aggiungiMenu(): void {
    this.menuDashboardService.addMenuItem(this.nuovaVoce).subscribe(() => {
      this.mostraFormAggiunta = false;
      this.nuovaVoce = { nome: '', prezzo: 0, quantita: 0, tipologia_id: null };
      this.getMenu();
    });
  }

  Rimuovi(id: number): void {
    this.menuDashboardService.deleteMenuItem(id).subscribe(() => this.getMenu());
  }

  Modifica(item: any): void {
    this.selectedItem = { ...item };
  }

  salvaModifiche(): void {
    const updated = {
      nome: this.selectedItem.nome,
      prezzo: this.selectedItem.prezzo,
      quantita: this.selectedItem.quantita,
      tipologia_id: this.selectedItem.tipologia_id
    };
    this.menuDashboardService.updateMenuItem(this.selectedItem.id, updated)
      .subscribe(() => {
        this.selectedItem = null;
        this.getMenu();
      });
  }

  annullaModifica(): void {
    this.selectedItem = null;
  }

  // ===== metodi per la ricerca =====

  cercaMenu(): void {
    const term = this.searchTerm.trim().toLowerCase();
    if (!term) {
      this.resetRicerca();
      return;
    }
    this.filteredItems = this.menuItems.filter(item =>
      item.nome.toLowerCase().includes(term)
    );
    this.ricercaAttiva = true;
  }

  resetRicerca(): void {
    this.searchTerm = '';
    this.filteredItems = [];
    this.ricercaAttiva = false;
  }
}
