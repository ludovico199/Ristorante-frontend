import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class OrdineService {
  private tavoloIdSubject = new BehaviorSubject<number | null>(null);
  private numeroCopertiSubject = new BehaviorSubject<number | null>(null);
  private tavoloStatusSubject = new BehaviorSubject<string>('IN CORSO'); // Stato iniziale

  tavoloId$ = this.tavoloIdSubject.asObservable();
  numeroCoperti$ = this.numeroCopertiSubject.asObservable();
  tavoloStatus$ = this.tavoloStatusSubject.asObservable();  // Observable per lo stato del tavolo

  setTavoloId(id: number) {
    this.tavoloIdSubject.next(id);
  }

  setTavoloEcoperti(tavoloId: number, numeroCoperti: number) {
    this.tavoloIdSubject.next(tavoloId);
    this.numeroCopertiSubject.next(numeroCoperti);
  }

  aggiornaStatoTavolo(status: string) {
    this.tavoloStatusSubject.next(status);
  }
}
