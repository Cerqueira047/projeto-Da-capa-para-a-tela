import { Routes } from '@angular/router';
export const routes: Routes = [
  {
    path: '',
    title: 'Central | INTERLINK',
    loadComponent: () => import('./pages/home').then((m) => m.Home),
  },
  {
    path: 'suspeitos',
    title: 'Suspeitos | INTERLINK',
    loadComponent: () => import('./pages/suspects').then((m) => m.Suspects),
  },
  {
    path: 'suspeitos/:id',
    title: 'Dossiê | INTERLINK',
    loadComponent: () => import('./pages/detail').then((m) => m.Detail),
  },
  { path: 'suspeito/:id', redirectTo: 'suspeitos/:id', pathMatch: 'full' },
  {
    path: 'novo-caso',
    title: 'Novo caso | INTERLINK',
    loadComponent: () => import('./pages/new-case').then((m) => m.NewCase),
  },
  {
    path: '**',
    title: 'Página não encontrada | INTERLINK',
    loadComponent: () => import('./pages/not-found').then((m) => m.NotFound),
  },
];
