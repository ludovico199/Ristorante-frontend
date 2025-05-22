import { Component, Input, Output, EventEmitter } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { CommonModule, NgClass } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { FilterByCategoryPipe } from '../filter-by-category.pipe';
import { OrdineService } from '../servizi/ordine-service.service';
import { ChangeDetectorRef } from '@angular/core';


@Component({
  selector: 'app-menu',
  standalone: true,
  imports: [CommonModule, HttpClientModule, FormsModule, FilterByCategoryPipe, NgClass],
  templateUrl: './menu.component.html',
  styleUrls: ['./menu.component.css']
})


export class MenuComponent {
  @Input() isVisible: boolean = false;
  @Output() closeMenu = new EventEmitter<void>();
  tipologiaSelezionata: string | null = null;
  menu: any[] = [];
  tipologie: any[] = [];
  comandaId = 1;
  itemSelezionato: any | null = null;
  TurnoSelezionato: number | null = null;
  OrdineMenu: any[] = [];
  constructor(private http: HttpClient, private ordineService: OrdineService, private cdr: ChangeDetectorRef) {}
  tavoloId: number | null = null;
  statoOrdine = 'in corso'; // Stato dell'ordine
  numeroCoperti: number | null = null;
  listaOrdine: any[] = [];
  isCheckMenuVisible: boolean = false;
  turni: (number | string)[] = [...[1, 2, 3, 4, 5, 6], 'NO'];
  ordineConfermato: any[] = [];
  ordiniEsistenti: any[] = [];
  listaOrdineGruppata: { [key: string]: any[] } = {
    1: [],
    2: [],
    3: [],
    4: [],
    5: [],
    NO: []
  };
  ordiniCombinati = [...this.ordiniEsistenti, ...this.ordineConfermato];



  ngOnInit() {
    this.caricaMenu();
    this.ordineService.tavoloId$.subscribe(id => {
      this.tavoloId = id;
      this.recuperaOrdiniEsistenti();
    });

    this.ordineService.numeroCoperti$.subscribe(coperti => {
      this.numeroCoperti = coperti;
    });
  }


  private caricaMenu(): void {
    // Prima carichiamo le tipologie
    this.http.get<any[]>('http://localhost:8000/api/tipologie').subscribe({
      next: (response) => {
        this.tipologie = response;
        this.http.get<any[]>('http://localhost:8000/api/menu').subscribe({
          next: (response) => {
            this.menu = response.map(item => {
              const tipologia = this.tipologie.find(t => t.id === item.tipologia_id);
              return {
                ...item,
                quantita: 0,
                tipologia: tipologia?.descrittivo || 'Sconosciuto',
                colore: tipologia?.colore || '#ccc'
              };
            });

            // Forza la rilevazione dei cambiamenti e il rendering della vista
            this.cdr.detectChanges();
          },
          error: (err) => {
            console.error('Errore durante il recupero dei dati menu:', err);
          }
        });
      },
      error: (err) => {
        console.error('Errore durante il recupero delle tipologie:', err);
      }
    });
  }

  getNomeTipologia(tipologia_id: number): string {
    const tipologia = this.tipologie.find(t => t.id === tipologia_id);
    return tipologia ? tipologia.descrittivo : 'Sconosciuto';
  }

  chiudiMenu() {
    this.closeMenu.emit();
    this.tipologie.forEach(t => t.attiva = false);
    this.tipologiaSelezionata = null;
    this.isCheckMenuVisible = false;
  }

  selezionaCategoria(tipologia: any) {
    if (this.tipologiaSelezionata === tipologia.descrittivo) {
      this.tipologiaSelezionata = null;
      tipologia.attiva = false;
    } else {
      this.tipologie.forEach(c => c.attiva = false);
      tipologia.attiva = true;
      this.tipologiaSelezionata = tipologia.descrittivo;
    }
  }


  // zona invio ordine
  apriGestioneQuantita(item: any) {
    this.itemSelezionato = item;
  }

  GestioneTurni(turno: number | string) {
    if (this.TurnoSelezionato === turno || (this.TurnoSelezionato === 6 && turno === 'NO')) {
      this.TurnoSelezionato = null;
    } else {
      this.TurnoSelezionato = turno === 'NO' ? 6 : turno as number;
    }
  }


  chiudiGestioneQuantita(event: Event) {
    this.itemSelezionato = null;
    event.stopPropagation();
  }

  incrementa(item: any) {
    item.quantita++;
  }

  decrementa(item: any) {
    if (item.quantita > 0) {
      item.quantita--;
  
      if (item.quantita === 0) {
        // Rimuove sia dalla lista visiva che da OrdineMenu (solo se non è serverData)
        if (!item.isServerData) {
          this.OrdineMenu = this.OrdineMenu.filter(i =>
            !(i.menu_id === item.menu_id && i.comanda_id === item.comanda_id)
          );
        }
  
        this.listaOrdine = this.listaOrdine.filter(i =>
          !(i.menu_id === item.menu_id && i.comanda_id === item.comanda_id)
        );
  
        // Aggiorna la listaOrdineGruppata
        this.listaOrdineGruppata = this.listaOrdine.reduce((acc, item) => {
          const turno = item.turno;
          if (!acc[turno]) acc[turno] = [];
          acc[turno].push(item);
          return acc;
        }, {});
      }
    }
  }
  


  CreaListaOrdine(item: any) {
    if (item.quantita > 0) {
      // Controlla se la combinazione menu_id + comanda_id esiste già nell'OrdineMenu
      const esistente = this.OrdineMenu.some(existingItem =>
        existingItem.menu_id === item.id && existingItem.comanda_id === this.TurnoSelezionato
      );

      if (!esistente) {
        const ListaOrdine = {
          menu_id: item.id,
          quantita: item.quantita,
          note: item.note || '',
          comanda_id: this.TurnoSelezionato,
        };
        this.OrdineMenu.push(ListaOrdine);
        item.quantita = 0;
        item.note = '';
        this.TurnoSelezionato = null;
        this.itemSelezionato = null;
      } else {
        console.log("Ordine già esistente per questa combinazione menu_id e comanda_id.");
      }
    }
  }


  inviaOrdine() {
    if (this.OrdineMenu.length > 0 && this.tavoloId && this.numeroCoperti !== null) {
      const statoOrdineId = 1;
      const datiOrdine = {
        numero_coperti: this.numeroCoperti,
        stato_ordine: statoOrdineId,
        tavolo_id: this.tavoloId,
        comanda_id: this.TurnoSelezionato,
        menu_items: this.OrdineMenu.map(item => ({
          menu_id: item.menu_id,
          quantita: item.quantita,
          note: item.note || null,
          comanda_id: item.comanda_id ?? 6,
        })),
    };

      this.http.post('http://localhost:8000/api/crea-ordine', datiOrdine).subscribe({
        next: (response) => {
          this.OrdineMenu = [];
          this.aggiornaListaOrdine();
        },
        error: (err) => {
          console.error('Errore nell’invio dell’ordine:', err);
        }
      });
    } else {
      console.log('Errore: tavolo o numero coperti non disponibili o nessun ordine.');
    }
  }


      // CHECK MENU

  CheckMenu() {
    this.recuperaOrdiniEsistenti();
    if (this.isCheckMenuVisible) {
      this.isCheckMenuVisible = false;
    } else {
      this.listaOrdine = [
        ...this.OrdineMenu.map(item => {
          const menuItem = this.menu.find(m => m.id === item.menu_id);
          return {
            ...item,
            nome: menuItem ? menuItem.nome : 'Voce sconosciuta',
            prezzo: menuItem ? menuItem.prezzo : 0,
            turno: item.comanda_id ?? 'NO',
            isServerData: false
          };
        }),
        ...this.ordiniEsistenti.map(item => {
          const menuItem = this.menu.find(m => m.id === item.menu_id);
          return {
            ...item,
            nome: menuItem ? menuItem.nome : 'Voce sconosciuta',
            prezzo: menuItem ? menuItem.prezzo : 0,
            turno: item.comanda_id ?? 'NO',
            isServerData: true
          };
        })
      ];
      if (Object.keys(this.listaOrdineGruppata).length === 0) {
        
        this.ordineService.aggiornaStatoTavolo('TERMINATO');
      } else {
        this.ordineService.aggiornaStatoTavolo('IN CORSO');
      }
      this.listaOrdineGruppata = this.listaOrdine.reduce((acc, item) => {
        const turno = item.turno;
        if (!acc[turno]) {
          acc[turno] = [];
        }
        acc[turno].push(item);
        return acc;
      }, {});

      this.isCheckMenuVisible = true;
    }

  }

  aggiornaListaOrdine() {
    this.recuperaOrdiniEsistenti();
    this.listaOrdine = [
      ...this.OrdineMenu.map(item => {
        const menuItem = this.menu.find(m => m.id === item.menu_id);
        return {
          ...item,
          nome: menuItem ? menuItem.nome : 'Voce sconosciuta',
          prezzo: menuItem ? menuItem.prezzo : 0,
          turno: item.comanda_id ?? 'NO',
          isServerData: false
        };
      }),
      ...this.ordiniEsistenti.map(item => {
        const menuItem = this.menu.find(m => m.id === item.menu_id);
        return {
          ...item,
          nome: menuItem ? menuItem.nome : 'Voce sconosciuta',
          prezzo: menuItem ? menuItem.prezzo : 0,
          turno: item.comanda_id ?? 'NO',
          isServerData: true
        };
      })
    ];

    this.listaOrdineGruppata = this.listaOrdine.reduce((acc, item) => {
      const turno = item.turno;
      if (!acc[turno]) {
        acc[turno] = [];
      }
      acc[turno].push(item);
      return acc;
    }, {});
  }


  rimuoviItem(item: any) {
    this.OrdineMenu = this.OrdineMenu.filter(i => i.menu_id !== item.menu_id || i.comanda_id !== item.comanda_id);
    this.listaOrdine = this.listaOrdine.filter(i => i.menu_id !== item.menu_id || i.comanda_id !== item.comanda_id);
    this.listaOrdineGruppata = this.listaOrdine.reduce((acc, item) => {
      const turno = item.turno;
      if (!acc[turno]) {
        acc[turno] = [];
      }
      acc[turno].push(item);
      return acc;
    }, {});
  }

  recuperaOrdiniEsistenti() {
    if (this.tavoloId) {
      this.http.get<any[]>(`http://localhost:8000/api/ordini?tavolo_id=${this.tavoloId}`).subscribe({
        next: (response) => {
          this.ordiniEsistenti = response;
          this.ordiniCombinati = [...this.ordiniEsistenti, ...this.ordineConfermato];
        },
        error: (err) => {
          console.error('Errore nel recupero degli ordini esistenti:', err);
        }
      });
    }
  }
}

