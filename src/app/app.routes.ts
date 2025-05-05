import { Routes } from '@angular/router';

export const routes: Routes = [
  { path: 'tavoli', loadComponent: () => import('./tavoli/tavoli.component').then(m => m.TavoliComponent) },
  { path: 'cucina', loadComponent: () => import('./cucina/cucina.component').then(m => m.CucinaComponent) },
  { path: '', redirectTo: '/tavoli', pathMatch: 'full' },
  { path: 'coperti/:id', loadComponent: () => import('./coperti/coperti.component').then(m => m.CopertiComponent) },
  { path: 'dashboard', loadComponent: () => import('./dashboard/dashboard.component').then(m => m.DashboardComponent) },
];
