import { Component, OnInit } from '@angular/core';
import { MenuDashboardService } from '../servizi/menu-dashboard.service';
import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    HttpClientModule,
    FormsModule,
  ],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit {
  activeTab: string = 'menu';
  menuItems: any[] = [];
  selectedItem: any = null;
  tipologie: any[] = [];

  constructor(private menuDashboardService: MenuDashboardService) {}

  ngOnInit(): void {
    this.getMenu();
    this.getTipologie();
  }

  getMenu(): void {
    this.menuDashboardService.getMenu().subscribe({
      next: (data) => {
        console.log('Dati ricevuti dal server:', data);
        this.menuItems = data;
        this.menuItems.forEach(item => {
          const tipologia = this.tipologie.find(t => t.id === item.tipologia_id);
          if (tipologia) {
            item.tipologia = tipologia.descrittivo;
          }
        });
      },
      error: (error) => {
        console.error('Errore nella richiesta menu:', error);
      }
    });
  }

  getTipologie(): void {
    this.menuDashboardService.getTipologie().subscribe({
      next: (data) => {
        this.tipologie = data;
        this.getMenu();
      },
      error: (error) => {
        console.error('Errore nel recupero delle tipologie:', error);
      }
    });
  }


  Rimuovi(id: number): void {
    this.menuDashboardService.deleteMenuItem(id).subscribe(() => {
      this.getMenu();
    });
  }


  Modifica(item: any): void {
    console.log('Modifica chiamata per:', item);
    this.selectedItem = {
      id: item.id,
      nome: item.nome,
      prezzo: item.prezzo,
      tipologia_id: item.tipologia_id
    };

    this.menuDashboardService.getTipologie().subscribe({
      next: (data) => {
        this.tipologie = data;
      },
      error: (err) => {
        console.error('Errore nel caricamento delle tipologie', err);
      }
    });
  }



  salvaModifiche(): void {
    const updatedMenu = {
      nome: this.selectedItem.nome,
      prezzo: this.selectedItem.prezzo,
      tipologia_id: this.selectedItem.tipologia_id
    };
    console.log('Dati inviati al server:', updatedMenu); // 👈 log di debug
    this.menuDashboardService.updateMenuItem(this.selectedItem.id, updatedMenu).subscribe(() => {
      this.selectedItem = null;
      this.getMenu();
    });
  }
  annullaModifica(): void {
    this.selectedItem = null;
  }

}
