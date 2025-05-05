import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'filterByCategory',
  standalone: true
})
export class FilterByCategoryPipe implements PipeTransform {
  transform(menu: any[], categoria: string | null): any[] {
    if (!categoria) {
      return menu; // Se nessuna categoria è selezionata, mostra tutto il menu
    }
    return menu.filter(item => item.tipologia === categoria);
  }
}
