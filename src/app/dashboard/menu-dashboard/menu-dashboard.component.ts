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

  nuovaVoce = {
    nome: '',
    prezzo: 0,
    tipologia_id: null
  };

  constructor(private menuDashboardService: MenuDashboardService) {}

  ngOnInit(): void {
    this.getTipologie();
  }

  getTipologie(): void {
    this.menuDashboardService.getTipologie().subscribe({
      next: (data) => {
        this.tipologie = data;
        this.getMenu();
      },
      error: (error) => console.error('Errore nel recupero tipologie:', error)
    });
  }

  getMenu(): void {
    this.menuDashboardService.getMenu().subscribe({
      next: (data) => {
        this.menuItems = data.map(item => {
          const tipo = this.tipologie.find(t => t.id === item.tipologia_id);
          return { ...item, tipologia: tipo?.descrittivo };
        });
      },
      error: (error) => console.error('Errore nel recupero menu:', error)
    });
  }

  aggiungiMenu(): void {
    this.menuDashboardService.addMenuItem(this.nuovaVoce).subscribe(() => {
      this.mostraFormAggiunta = false;
      this.nuovaVoce = { nome: '', prezzo: 0, tipologia_id: null };
      this.getMenu();
    });
  }

  Rimuovi(id: number): void {
    this.menuDashboardService.deleteMenuItem(id).subscribe(() => {
      this.getMenu();
    });
  }

  Modifica(item: any): void {
    this.selectedItem = { ...item };
  }

  salvaModifiche(): void {
    const updated = {
      nome: this.selectedItem.nome,
      prezzo: this.selectedItem.prezzo,
      tipologia_id: this.selectedItem.tipologia_id
    };
    this.menuDashboardService.updateMenuItem(this.selectedItem.id, updated).subscribe(() => {
      this.selectedItem = null;
      this.getMenu();
    });
  }

  annullaModifica(): void {
    this.selectedItem = null;
  }
}
