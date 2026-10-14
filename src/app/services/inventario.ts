import { Injectable, inject } from '@angular/core';
import { SupabaseService } from './supabase';

export interface Categoria { id_categoria: number; nombre: string; }
export interface Producto {
  id_producto: number;
  id_categoria: number;
  nombre: string;
  descripcion: string | null;
  precio: number;
  stock: number;
  categorias: { nombre: string } | null;
}

@Injectable({ providedIn: 'root' })
export class Inventario {
  private readonly db = inject(SupabaseService).client;

  async listarProductos(): Promise<Producto[]> {
    const { data, error } = await this.db.from('productos')
      .select('id_producto,id_categoria,nombre,descripcion,precio,stock,categorias(nombre)')
      .order('id_producto');
    if (error) throw error;
    return (data ?? []) as unknown as Producto[];
  }

  async listarCategorias(): Promise<Categoria[]> {
    const { data, error } = await this.db.from('categorias')
      .select('id_categoria,nombre').order('nombre');
    if (error) throw error;
    return data ?? [];
  }

  async crearProducto(producto: { id_categoria: number; nombre: string; descripcion: string; precio: number }): Promise<void> {
    const { error } = await this.db.from('productos').insert({ ...producto, stock: 0 });
    if (error) throw error;
  }

  async registrarMovimiento(productoId: number, tipo: 'ENTRADA' | 'SALIDA', cantidad: number, observacion: string): Promise<void> {
    const { error } = await this.db.rpc('registrar_movimiento', {
      p_id_producto: productoId,
      p_tipo: tipo,
      p_cantidad: cantidad,
      p_observacion: observacion || null
    });
    if (error) throw error;
  }
}
