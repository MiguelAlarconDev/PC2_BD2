import { Component, inject, signal, OnInit } from '@angular/core';
import { CurrencyPipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { Auth } from '../services/auth';
import { Categoria, Inventario, Producto } from '../services/inventario';

@Component({
  selector: 'app-dashboard',
  imports: [CurrencyPipe, FormsModule],
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
  readonly saving = signal(false);
  readonly error = signal('');
  readonly success = signal('');
  readonly productos = signal<Producto[]>([]);
  readonly categorias = signal<Categoria[]>([]);

  nuevoNombre = '';
  nuevaDescripcion = '';
  nuevaCategoria: number | null = null;
  nuevoPrecio: number | null = null;
  movimientoProducto: number | null = null;
  movimientoTipo: 'ENTRADA' | 'SALIDA' = 'ENTRADA';
  movimientoCantidad: number | null = null;
  movimientoObservacion = '';

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
      const [productos, categorias] = await Promise.all([
        this.inventario.listarProductos(),
        this.inventario.listarCategorias()
      ]);
      this.productos.set(productos);
      this.categorias.set(categorias);
    } catch (error) {
      this.error.set('Error consultando Supabase: ' + this.errorMessage(error));
    } finally {
      this.fetching.set(false);
    }
  }

  async crearProducto(): Promise<void> {
    if (this.saving()) return;
    if (!this.nuevoNombre.trim() || !this.nuevaCategoria || this.nuevoPrecio === null || !Number.isFinite(this.nuevoPrecio) || this.nuevoPrecio < 0) {
      this.error.set('Completa nombre, categoría y precio válido.');
      return;
    }
    this.saving.set(true);
    this.error.set('');
    this.success.set('');
    try {
      await this.inventario.crearProducto({
        nombre: this.nuevoNombre.trim(),
        descripcion: this.nuevaDescripcion.trim(),
        id_categoria: Number(this.nuevaCategoria),
        precio: Number(this.nuevoPrecio)
      });
      this.nuevoNombre = '';
      this.nuevaDescripcion = '';
      this.nuevaCategoria = null;
      this.nuevoPrecio = null;
      this.success.set('Producto registrado con stock inicial 0.');
      await this.recargar();
    } catch (error) {
      this.error.set('No se pudo registrar el producto: ' + this.errorMessage(error));
    } finally {
      this.saving.set(false);
    }
  }

  async registrarMovimiento(): Promise<void> {
    if (this.saving()) return;
    if (!this.movimientoProducto || this.movimientoCantidad === null || !Number.isInteger(this.movimientoCantidad) || this.movimientoCantidad <= 0) {
      this.error.set('Selecciona un producto y una cantidad entera mayor que cero.');
      return;
    }
    this.saving.set(true);
    this.error.set('');
    this.success.set('');
    try {
      await this.inventario.registrarMovimiento(Number(this.movimientoProducto), this.movimientoTipo, Number(this.movimientoCantidad), this.movimientoObservacion.trim());
      this.movimientoCantidad = null;
      this.movimientoObservacion = '';
      this.success.set('Movimiento registrado. Stock actualizado por el trigger de PostgreSQL.');
      await this.recargar();
    } catch (error) {
      this.error.set('No se pudo registrar el movimiento: ' + this.errorMessage(error));
    } finally {
      this.saving.set(false);
    }
  }

  private errorMessage(error: unknown): string {
    return error instanceof Error ? error.message : String(error);
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
