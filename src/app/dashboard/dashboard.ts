import { Component, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { Auth } from '../services/auth';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.css'
})
export class Dashboard {
  private readonly auth = inject(Auth);
  private readonly router = inject(Router);
  readonly email = signal('');
  readonly loading = signal(false);

  constructor() {
    void this.auth.getUser().then(({ data }) => this.email.set(data.user?.email ?? 'Usuario'));
  }

  async logout(): Promise<void> {
    this.loading.set(true);
    try {
      const { error } = await this.auth.logout();
      if (error) throw error;
      await this.router.navigateByUrl('/login');
    } catch {
      this.loading.set(false);
    }
  }
}
