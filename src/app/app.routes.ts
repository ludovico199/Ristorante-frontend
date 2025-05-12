import { Routes } from '@angular/router';

export const routes: Routes = [
  { path: 'tavoli', loadComponent: () => import('./tavoli/tavoli.component').then(m => m.TavoliComponent) },
  { path: 'cucina', loadComponent: () => import('./cucina/cucina.component').then(m => m.CucinaComponent) },
  { path: '', redirectTo: '/tavoli', pathMatch: 'full' },
  { path: 'coperti/:id', loadComponent: () => import('./coperti/coperti.component').then(m => m.CopertiComponent) },
  {
    path: 'dashboard',
    loadComponent: () => import('./dashboard/dashboard.component').then(m => m.DashboardComponent),
    children: [
      { path: 'menu', loadComponent: () => import('./dashboard/menu-dashboard/menu-dashboard.component').then(m => m.MenuDashboardComponent) },
      { path: 'categorie', loadComponent: () => import('./dashboard/categorie-dashboard/categorie-dashboard.component').then(m => m.CategorieDashboardComponent) },
      { path: 'tavoli', loadComponent: () => import('./dashboard/tavoli-dashboard/tavoli-dashboard.component').then(m => m.TavoliDashboardComponent) },
      { path: '', redirectTo: 'menu', pathMatch: 'full' }
    ]
  }
];
