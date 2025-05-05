import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})

export class DataService {
  private copertiSubject: BehaviorSubject<number> = new BehaviorSubject<number>(0);
  coperti$: Observable<number> = this.copertiSubject.asObservable();

  aggiornaCoperti(coperti: number): void {
    this.copertiSubject.next(coperti);
  }
}
