import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MenuDashboardService } from '../../servizi/menu-dashboard.service';

type SortKey = 'nome' | 'tipologia' | 'prezzo' | 'quantita' | '';
type SortDirection = 1 | -1;

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
  searchTerm = '';
  filteredItems: any[] = [];
  ricercaAttiva = false;
  sortKey: SortKey = '';
  sortDir: SortDirection = 1;
  nuovaVoce = { nome: '', prezzo: 0, quantita: 0, tipologia_id: null as number | null };

  constructor(private menuDashboardService: MenuDashboardService) {}

  ngOnInit(): void {
    this.menuDashboardService.getTipologie().subscribe({
      next: data => {
        this.tipologie = data;
        this.loadMenu();
      }
    });
  }

  loadMenu(): void {
    this.menuDashboardService.getMenu().subscribe({
      next: data => {
        this.menuItems = data.map(item => {
          const tipo = this.tipologie.find(t => t.id === item.tipologia_id);
          return { ...item, tipologia: tipo?.descrittivo || '' };
        });
        if (this.ricercaAttiva) {
          this.onSearch();
        }
        this.applySort();
      }
    });
  }

  onSort(key: SortKey): void {
    if (this.sortKey === key) {
      this.sortDir = this.sortDir === 1 ? -1 : 1;
    } else {
      this.sortKey = key;
      this.sortDir = (key === 'quantita' || key === 'prezzo') ? -1 : 1;
    }
    this.applySort();
  }

  private applySort(): void {
    const list = this.ricercaAttiva ? this.filteredItems : this.menuItems;
    list.sort((a, b) => {
      const av = a[this.sortKey];
      const bv = b[this.sortKey];
      if (this.sortKey === 'quantita' || this.sortKey === 'prezzo') {
        return (bv - av) * this.sortDir;
      }
      const sa = ('' + av).toLowerCase();
      const sb = ('' + bv).toLowerCase();
      if (sa < sb) return -1 * this.sortDir;
      if (sa > sb) return 1 * this.sortDir;
      return 0;
    });
  }

  onSearch(): void {
    const term = this.searchTerm.trim().toLowerCase();
    if (!term) {
      this.resetSearch();
      return;
    }
    this.filteredItems = this.menuItems.filter(item =>
      item.nome.toLowerCase().includes(term)
    );
    this.ricercaAttiva = true;
    this.applySort();
  }

  resetSearch(): void {
    this.searchTerm = '';
    this.filteredItems = [];
    this.ricercaAttiva = false;
    this.applySort();
  }

  aggiungiMenu(): void {
    this.menuDashboardService.addMenuItem(this.nuovaVoce).subscribe(() => {
      this.mostraFormAggiunta = false;
      this.nuovaVoce = { nome: '', prezzo: 0, quantita: 0, tipologia_id: null };
      this.loadMenu();
    });
  }

  Rimuovi(id: number): void {
    this.menuDashboardService.deleteMenuItem(id).subscribe(() => this.loadMenu());
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
        this.loadMenu();
      });
  }

  annullaModifica(): void {
    this.selectedItem = null;
  }
}
