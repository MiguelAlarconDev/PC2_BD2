import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { Auth } from '../services/auth';

@Component({
  selector: 'app-login',
  imports: [FormsModule],
  templateUrl: './login.html',
  styleUrl: './login.css'
})
export class Login {
  private readonly auth = inject(Auth);
  private readonly router = inject(Router);
  email = '';
  password = '';
  readonly loading = signal(false);
  readonly error = signal('');

  async submit(): Promise<void> {
    if (this.loading()) return;
    this.loading.set(true);
    this.error.set('');
    try {
      const { error } = await this.auth.login(this.email.trim(), this.password);
      if (error) {
        this.error.set('Correo o contraseña incorrectos.');
        return;
      }
      await this.router.navigateByUrl('/dashboard');
    } catch {
      this.error.set('No se pudo conectar con Supabase. Intenta nuevamente.');
    } finally {
      this.loading.set(false);
    }
  }
}
