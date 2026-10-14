import { Component, inject, signal, OnInit } from '@angular/core';
import { CurrencyPipe } from '@angular/common';
import { Router } from '@angular/router';
import { Auth } from '../services/auth';
import { Inventario, Producto } from '../services/inventario';

@Component({
  selector: 'app-dashboard',
  imports: [CurrencyPipe],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.css'
})
export class Dashboard implements OnInit {
  private readonly auth = inject(Auth);
  private readonly router = inject(Router);
  private readonly inventario = inject(Inventario);
  readonly email = signal('');
  readonly loading = signal(false);
  readonly fetching = signal(true);
  readonly error = signal('');
  readonly productos = signal<Producto[]>([]);

  totalStock(): number {
    return this.productos().reduce((total, producto) => total + producto.stock, 0);
  }

  async ngOnInit(): Promise<void> {
    const { data } = await this.auth.getUser();
    this.email.set(data.user?.email ?? 'Usuario');
    await this.recargar();
  }

  async recargar(): Promise<void> {
    this.fetching.set(true);
    this.error.set('');
    try {
      this.productos.set(await this.inventario.listarProductos());
    } catch {
      this.error.set('No se pudieron consultar los productos. Revisa las políticas RLS de Supabase.');
    } finally {
      this.fetching.set(false);
    }
  }

  async logout(): Promise<void> {
    this.loading.set(true);
    try {
      const { error } = await this.auth.logout();
      if (error) throw error;
      await this.router.navigateByUrl('/login');
    } catch {
      this.error.set('No se pudo cerrar la sesión.');
      this.loading.set(false);
    }
  }
}
