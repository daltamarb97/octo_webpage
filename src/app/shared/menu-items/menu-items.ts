import { Injectable } from '@angular/core';

export interface Menu {
  state: string;
  name: string;
  type: string;
  icon: string;
}

const MENUITEMS = [
  { state: 'whatsapp', type: 'link', name: 'WhatsApp', icon: 'chat' },
  { state: 'chat-flow', type: 'link', name: 'Octo-Bot', icon: 'account_tree' },
  { state: 'tag-metrics', type: 'link', name: 'Estadísticas', icon: 'show_chart' },
  { state: 'tickets', type: 'link', name: 'Tickets', icon: 'fact_check' },
  { state: 'forms', type: 'link', name: 'Formularios', icon: 'format_quote' },
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
