import { Injectable } from '@angular/core';

export interface Menu {
  state: string;
  name: string;
  type: string;
  icon: string;
}

const MENUITEMS = [
  // { state: 'tabla-pagos', name: 'Tabla de pagos', type: 'link', icon: 'payment' },
  { state: 'canales-comunicacion', type: 'link', name: 'chats', icon: 'message' },
  { state: 'pizarra', type: 'link', name: 'Tareas', icon: 'message' },
  { state: 'directorio', type: 'link', name: 'Directorio', icon: 'book' },

];

@Injectable()
export class MenuItems {
  getMenuitem(): Menu[] {
    return MENUITEMS;
  }
}
