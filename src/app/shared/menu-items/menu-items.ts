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
  { state: 'whatsapp', type: 'link', name: 'WhatsApp', icon: 'chat' },
  { state: 'canales-comunicacion', type: 'link', name: 'Chats Internos', icon: 'message' },
  { state: 'directorio', type: 'link', name: 'Directorio', icon: 'book' },
  { state: 'perfil', type: 'link', name: 'Perfil', icon: 'account_circle' },

];

@Injectable()
export class MenuItems {
  getMenuitem(): Menu[] {
    return MENUITEMS;
  }
}
