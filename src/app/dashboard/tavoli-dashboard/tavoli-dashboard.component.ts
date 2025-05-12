import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { RouterModule } from '@angular/router';
import { MenuDashboardService } from '../../servizi/menu-dashboard.service';

@Component({
  selector: 'app-tavoli-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule, HttpClientModule, RouterModule],
  templateUrl: './tavoli-dashboard.component.html',
  styleUrls: ['./tavoli-dashboard.component.css']
})
export class TavoliDashboardComponent implements OnInit {
  tavoli: any[] = [];
  mostraFormAggiunta = false;
  selectedItem: any = null;

  nuovoTavolo = {
    numero_tavolo: 1,
    numero_coperti: 2
  };

  constructor(private menuDashboardService: MenuDashboardService) {}

  ngOnInit(): void {
    this.getTavoli();
  }

  getTavoli(): void {
    this.menuDashboardService.getTavoli().subscribe({
      next: (data) => this.tavoli = data,
      error: (err) => console.error('Errore nel caricamento tavoli:', err)
    });
  }

  aggiungiTavolo(): void {
    this.menuDashboardService.addTavolo(this.nuovoTavolo).subscribe({
      next: () => {
        this.mostraFormAggiunta = false;
        this.nuovoTavolo = { numero_tavolo: 1, numero_coperti: 2 };
        this.getTavoli();
      },
      error: (err) => console.error('Errore durante aggiunta tavolo:', err)
    });
  }

  Modifica(tavolo: any): void {
    this.selectedItem = { ...tavolo };
  }

  salvaModifiche(): void {
    const { id, numero_tavolo, numero_coperti } = this.selectedItem;
    this.menuDashboardService.updateTavolo(id, { numero_tavolo }).subscribe(() => {
      this.selectedItem = null;
      this.getTavoli();
    });
  }

  Rimuovi(id: number): void {
    this.menuDashboardService.deleteTavolo(id).subscribe(() => {
      this.getTavoli();
    });
  }

  annullaModifica(): void {
    this.selectedItem = null;
  }
}
