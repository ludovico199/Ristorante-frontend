import { ChangeDetectorRef, Component, Inject, PLATFORM_ID, OnInit, OnDestroy, ApplicationRef } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { Router } from '@angular/router';
import { MenuComponent } from '../menu/menu.component';
import { CopertiComponent } from '../coperti/coperti.component';
import { DataService } from '../servizi/data.service';
import { Subject, timer } from 'rxjs';
import { first, takeUntil, debounceTime } from 'rxjs/operators';
import { OrdineService } from '../servizi/ordine-service.service';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-tavoli',
  standalone: true,
  imports: [
    RouterModule,
    CommonModule,
    HttpClientModule,
    MenuComponent,
    CopertiComponent,
  ],
  templateUrl: './tavoli.component.html',
  styleUrls: ['./tavoli.component.css']
})
export class TavoliComponent implements OnInit, OnDestroy {
  tavoli: any[] = [];
  tavoloSelezionato: any = null;
  tavoloStatus: string = 'Terminato'; // Inizialmente "Terminato"
  tavolocosto: number = 0;
  private destroy$ = new Subject<void>();
  private tavoliInterval: any = null;

  isMenuVisible: boolean = false;
  isCopertiVisible: boolean = false;
  TavoloAperto: boolean = false;
  comandaId: number = 1;

  // Nuove proprietà per overlay Ordine
  ordineAperto: boolean = false;
  ordineSelezionato: any = null;

  constructor(
    private router: Router,
    private http: HttpClient,
    private dataService: DataService,
    private applicationRef: ApplicationRef,
    private cdr: ChangeDetectorRef,
    @Inject(PLATFORM_ID) private platformId: Object,
    private ordineService: OrdineService
  ) {}

  ngOnInit() {
    this.caricaTavoli();
    this.ascoltaCoperti();
    this.applicationRef.isStable
      .pipe(first(isStable => isStable))
      .subscribe(() => this.iniziaControlloTavoli());

    this.ordineService.tavoloId$.subscribe();
    this.ordineService.numeroCoperti$.subscribe();
    this.ordineService.tavoloStatus$.subscribe(status => {
      this.tavoloStatus = status;
    });
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
    this.fermaAggiornamentoTavoli();
  }

  private iniziaControlloTavoli() {
    if (!this.tavoliInterval) {
      this.tavoliInterval = setInterval(() => {
        if (
          !this.isMenuVisible &&
          !this.isCopertiVisible &&
          !this.TavoloAperto &&
          !this.ordineAperto
        ) {
          this.caricaTavoli();
        }
      }, 5000);
    }
  }

  private fermaAggiornamentoTavoli() {
    if (this.tavoliInterval) {
      clearInterval(this.tavoliInterval);
      this.tavoliInterval = null;
    }
  }

  private caricaTavoli(): void {
    this.http.get<any[]>('http://localhost:8000/api/tavoli').subscribe({
      next: (response) => {
        this.tavoli = response.map(tavolo => {
          const righeOrdine = tavolo.righe_ordine ?? [];
  
          // Aggrega gli ordini uguali, ignorando comanda_id
          const ordini: any[] = [];
  
          righeOrdine.forEach((item: any) => {
            const nome = item.menu?.nome || 'Voce sconosciuta';
            const prezzo = item.menu?.prezzo || 0;
            const quantita = item.quantita;
            const note = item.note || '';
  
            // Cerca un item identico già aggiunto (ignorando comanda_id)
            const esistente = ordini.find(o =>
              o.nome === nome &&
              o.prezzo === prezzo &&
              o.note === note
            );
  
            if (esistente) {
              esistente.quantita += quantita;
            } else {
              ordini.push({ nome, prezzo, quantita, note });
            }
          });
  
          const stato = ordini.length > 0 ? 'IN CORSO' : 'TERMINATO';
  
          return { ...tavolo, ordini, stato };
        });
  
        if (this.tavoloSelezionato) {
          this.tavoloSelezionato =
            this.tavoli.find(t => t.id === this.tavoloSelezionato.id) || null;
        }
  
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Errore nel caricamento dei tavoli:', err);
      }
    });
  }
  
  
  

  toggleMenu(tavolo: any, event: MouseEvent): void {
    event.stopPropagation();
    const isCurrentlyOpen = tavolo.mostraMenu;
    this.tavoli.forEach(t => t.mostraMenu = false);
    tavolo.mostraMenu = !isCurrentlyOpen;
  }

  chiudiTavolo(tavolo: any, event: MouseEvent): void {
    event.stopPropagation(); // Ferma la propagazione del click

    tavolo.mostraMenu = false;

    // Imposta coperti a 0 via API
    this.http.put(`http://localhost:8000/api/coperti/${tavolo.id}`, { coperti: 0 }).subscribe({
      next: () => {
        this.chiudiOverlay();
        this.caricaTavoli(); // aggiorna la lista dei tavoli
      },
      error: (err) => {
        console.error('Errore nell\'azzeramento dei coperti:', err);
      }
    });
  }

  private ascoltaCoperti() {
    if (this.tavoloSelezionato) {
      const tavoloId = this.tavoloSelezionato.id;
      const coperti = this.tavoloSelezionato.numero_coperti;

      this.http.put(`http://localhost:8000/api/coperti/${tavoloId}`, { coperti }).subscribe({
        next: () => this.caricaTavoli(),
        error: (err) => console.error('Errore nell\'aggiornamento dei coperti:', err)
      });
    }
  }

  selezionaTavolo(id: number) {
    this.ordineService.setTavoloId(id);
    const tavolo = this.tavoli.find(t => t.id === id);
    if (tavolo) {
      this.ordineService.setTavoloEcoperti(tavolo.id, tavolo.numero_coperti);
    }
  }

  getClasseTavolo(tavolo: any): string {
    const coperti = Number(tavolo.numero_coperti || 0);
    return coperti > 0 ? 'tavolo_occupato' : 'tavolo_libero';
  }

  toggleVisibility(tavolo: any) {
    tavolo.hideDetails = !tavolo.hideDetails;
    this.cdr.detectChanges();
  }

  chiudiMenu(): void {
    this.TavoloAperto = false;
    this.isMenuVisible = false;
    this.isCopertiVisible = false;
    this.caricaTavoli();
    this.riprendiAggiornamentoTavoli();
  }

  chiudiCoperti(): void {
    this.TavoloAperto = false;
    this.isMenuVisible = false;
    this.isCopertiVisible = false;
    this.caricaTavoli();
    this.riprendiAggiornamentoTavoli();
  }

  gestiscitavolo(tavolo: any) {
    this.selezionaTavolo(tavolo.id);
    this.TavoloAperto = true;

    if (tavolo.numero_coperti === 0) {
      this.apricopoerti(tavolo);
    } else {
      this.aprimenu(tavolo);
    }

    this.cdr.detectChanges();
  }

  aprimenu(tavolo: any): void {
    this.TavoloAperto = true;
    this.isMenuVisible = true;
    this.fermaAggiornamentoTavoli();
  }

  apricopoerti(tavolo: any): void {
    this.tavoloSelezionato = tavolo;
    this.isCopertiVisible = true;
    this.fermaAggiornamentoTavoli();
  }

  riprendiAggiornamentoTavoli() {
    if (!this.isMenuVisible && !this.isCopertiVisible && !this.TavoloAperto && !this.ordineAperto) {
      this.iniziaControlloTavoli();
    }
  }

  /*** Funzioni Overlay Ordine ***/
  apriOrdine(tavolo: any, event: MouseEvent): void {
    event.stopPropagation();
    this.ordineSelezionato = tavolo;
    this.ordineAperto = true;
    this.fermaAggiornamentoTavoli();
  }

  chiudiOverlay(): void {
    this.ordineAperto = false;
    this.riprendiAggiornamentoTavoli();
  }

  getTotale(ordini: any[]): number {
    return ordini?.reduce((sum, o) => sum + ((o.prezzo || 0) * (o.quantita || 1)), 0) || 0;
  }
}
