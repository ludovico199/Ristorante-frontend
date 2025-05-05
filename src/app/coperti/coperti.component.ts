import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http'; // Importa HttpClient

@Component({
  selector: 'app-coperti',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
  ],
  templateUrl: './coperti.component.html',
  styleUrls: ['./coperti.component.css']
})
export class CopertiComponent {
  @Input() isVisible: boolean = false;
  @Input() tavoloId: number = 0;
  @Output() closeCoperti = new EventEmitter<void>();

  numeroCoperti: number = 0;

  constructor(private http: HttpClient) {} // Inietta HttpClient

  chiudiCoperti() {
    this.closeCoperti.emit();
  }

  salvaCoperti() {
    if (this.tavoloId && this.numeroCoperti > 0) {
      // Aggiungi il log per verificare l'ID e l'URL
      console.log("ID Tavolo:", this.tavoloId);
      console.log(`Invio richiesta PUT all'URL: http://localhost:8000/api/coperti/${this.tavoloId}`);

      // Dati da inviare nella richiesta
      const data = {
        coperti: this.numeroCoperti
      };

      // Invio la richiesta PUT
      this.http.put(`http://localhost:8000/api/coperti/${this.tavoloId}`, data).subscribe(
        response => {
          console.log('Coperti aggiornati con successo:', response);
          this.chiudiCoperti(); // Chiudi la finestra
        },
        error => {
          console.error('Errore nel salvataggio dei coperti:', error);
        }
      );
    } else {
      console.warn("⚠️ Inserisci un numero valido di coperti!");
    }
  }



}
