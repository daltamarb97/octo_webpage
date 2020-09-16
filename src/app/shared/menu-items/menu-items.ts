import { Injectable } from '@angular/core';

export interface Menu {
  state: string;
  name: string;
  type: string;
  icon: string;
}

const MENUITEMS = [
  { state: 'whatsapp', type: 'link', name: 'WhatsApp', icon: 'chat' },
  { state: 'chat-flow', type: 'link', name: 'Flujos de chat', icon: 'chat' },

  { state: 'tag-metrics', type: 'link', name: 'Estadísticas', icon: 'fact_check' },
  { state: 'canales-comunicacion', type: 'link', name: 'chats', icon: 'message' },

  { state: 'directorio', type: 'link', name: 'Directorio', icon: 'book' },
  { state: 'perfil', type: 'link', name: 'Perfil', icon: 'account_circle' },

];

@Injectable()
export class MenuItems {
  getMenuitem(): Menu[] {
    return MENUITEMS;
  }
}
