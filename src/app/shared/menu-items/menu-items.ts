import { Injectable } from '@angular/core';

export interface Menu {
  state: string;
  name: string;
  type: string;
  icon: string;
}

const MENUITEMS = [
  // { state: 'tabla-pagos', name: 'Tabla de pagos', type: 'link', icon: 'payment' },
  { state: 'inicio', type: 'link', name: 'Inicio', icon: 'home' },
  { state: 'canales-comunicacion', type: 'link', name: 'chats', icon: 'message' },
  { state: 'tareas', type: 'link', name: 'Tareas', icon: 'fact_check' },
  { state: 'directorio', type: 'link', name: 'Directorio', icon: 'book' },
  { state: 'perfil', type: 'link', name: 'Perfil', icon: 'account_circle' },

];

@Injectable()
export class MenuItems {
  getMenuitem(): Menu[] {
    return MENUITEMS;
  }
}
