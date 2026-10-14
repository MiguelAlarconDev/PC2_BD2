import { Injectable, inject } from '@angular/core';
import { SupabaseService } from './supabase';

export interface Categoria {
  id_categoria: number;
  nombre: string;
}
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
      .order('id_producto', { ascending: true });
    if (error) throw error;
    return (data ?? []) as unknown as Producto[];
  }
}
