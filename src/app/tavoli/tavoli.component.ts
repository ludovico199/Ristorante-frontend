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
    this.applicationRef.isStable.pipe(first((isStable) => isStable)).subscribe(() => {
      this.iniziaControlloTavoli();
    });
    this.ordineService.tavoloId$.subscribe(tavoloId => {});

    this.ordineService.numeroCoperti$.subscribe(coperti => {});
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
        if (!this.isMenuVisible && !this.isCopertiVisible && !this.TavoloAperto) {
          this.caricaTavoli();
        }
      },50000000);
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
          // se non esiste ordini, inizializza array vuoto
          const ordini = tavolo.ordini ?? [];
          const ordiniAttivi = ordini.filter((o: any) => o.stato_ordine_id !== 2);
          const stato = ordiniAttivi.length > 0 ? 'IN CORSO' : 'TERMINATO';
          return {
            ...tavolo,
            stato
          };
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
      next: (response) => {
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

      // Modifica i coperti direttamente attraverso l'API
      this.http.put(`http://localhost:8000/api/coperti/${tavoloId}`, { coperti }).subscribe({
        next: (response) => {
          this.caricaTavoli();  // Ricarica i tavoli per riflettere i cambiamenti
        },
        error: (err) => {
          console.error('Errore nell\'aggiornamento dei coperti:', err);
        }
      });
    }
  }

  selezionaTavolo(id: number) {
    this.ordineService.setTavoloId(id);

    // Trova il tavolo e aggiorna anche il numero di coperti
    const tavolo = this.tavoli.find(t => t.id === id);
    if (tavolo) {
      this.ordineService.setTavoloEcoperti(tavolo.id, tavolo.numero_coperti);
    }
  }

  getClasseTavolo(tavolo: any): string {
    const coperti = tavolo.numero_coperti;
    return (coperti === null || coperti === undefined || Number(coperti) === 0) ? 'tavolo_libero' : 'tavolo_occupato';
  }

  toggleVisibility(tavolo: any) {
    tavolo.hideDetails = !tavolo.hideDetails;
    this.cdr.detectChanges();
  }

  chiudiMenu(): void {
    this.TavoloAperto = false;
    this.isMenuVisible = false;
    this.isCopertiVisible = false;
    console.log('Menu chiuso');
    this.caricaTavoli();
    this.riprendiAggiornamentoTavoli();
  }

  chiudiCoperti(): void {
    this.TavoloAperto = false;
    this.isMenuVisible = false;
    this.isCopertiVisible = false;
    console.log('Coperti chiusi');
    this.caricaTavoli();
    this.riprendiAggiornamentoTavoli();
  }

  gestiscitavolo(tavolo: any) {
    this.selezionaTavolo(tavolo.id); // Aggiungi questa riga per selezionare il tavolo
    this.TavoloAperto = true;

    // Verifica corretta se il numero di coperti è 0 o meno
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
    this.fermaAggiornamentoTavoli(); // Ferma il timer quando il menu è visibile
  }

  apricopoerti(tavolo: any): void {
    this.tavoloSelezionato = tavolo;
    this.isCopertiVisible = true;
    this.fermaAggiornamentoTavoli(); // Ferma il timer quando i coperti sono visibili
  }

  riprendiAggiornamentoTavoli() {
    if (!this.isMenuVisible && !this.isCopertiVisible && !this.tavoliInterval) {
      this.iniziaControlloTavoli();
    }
  }


  private controllaStatoTavolo(): void {
    // Verifica se ci sono ordini attivi
    const ordiniAttivi = this.tavoloSelezionato?.ordini?.filter((ordine: any) => ordine.stato_ordine_id !== 2);
    if (ordiniAttivi && ordiniAttivi.length === 0) {
      this.tavoloStatus = 'TERMINATO';
    } else {
      this.tavoloStatus = 'IN CORSO';
    }
  }
}
