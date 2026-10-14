import { Routes } from '@angular/router';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { Auth } from './services/auth';

export const routes: Routes = [
  { path: 'login', loadComponent: () => import('./login/login').then(m => m.Login) },
  {
    path: 'dashboard',
    canActivate: [async () => {
      const auth = inject(Auth);
      const router = inject(Router);
      const { data, error } = await auth.getUser();
      return !error && data.user ? true : router.createUrlTree(['/login']);
    }],
    loadComponent: () => import('./dashboard/dashboard').then(m => m.Dashboard)
  },
  { path: '', pathMatch: 'full', redirectTo: 'login' },
  { path: '**', redirectTo: 'login' }
];
