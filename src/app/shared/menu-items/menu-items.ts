import { Injectable } from '@angular/core';
import {
  HoldDataService
} from '../../core/services/hold-data.service';

export interface Menu {
  state: string;
  name: string;
  type: string;
  icon: string;
}

const MENUITEMSORDERS = [
  { state: 'pedidos', type: 'link', name: 'Pedidos', icon: 'fact_check' },
  { state: 'whatsapp', type: 'link', name: 'WhatsApp', icon: 'chat' },
  { state: 'chat-flow', type: 'link', name: 'Octo-Bot', icon: 'account_tree' },
  { state: 'tag-metrics', type: 'link', name: 'Estadísticas', icon: 'show_chart' },
  { state: 'tickets', type: 'link', name: 'Tickets', icon: 'fact_check' },
  { state: 'forms', type: 'link', name: 'Encuestas', icon: 'format_quote' },
  { state: 'canales-comunicacion', type: 'link', name: 'chats', icon: 'message' },
  { state: 'directorio', type: 'link', name: 'Directorio', icon: 'book' },
  { state: 'perfil', type: 'link', name: 'Perfil', icon: 'account_circle' },

];

const MENUITEMS = [
  { state: 'whatsapp', type: 'link', name: 'WhatsApp', icon: 'chat' },
  { state: 'chat-flow', type: 'link', name: 'Octo-Bot', icon: 'account_tree' },
  { state: 'tag-metrics', type: 'link', name: 'Estadísticas', icon: 'show_chart' },
  { state: 'tickets', type: 'link', name: 'Tickets', icon: 'fact_check' },
  { state: 'forms', type: 'link', name: 'Encuestas', icon: 'format_quote' },
  { state: 'canales-comunicacion', type: 'link', name: 'chats', icon: 'message' },
  { state: 'directorio', type: 'link', name: 'Directorio', icon: 'book' },
  { state: 'perfil', type: 'link', name: 'Perfil', icon: 'account_circle' },

];

@Injectable()
export class MenuItems {
  constructor(private holdData: HoldDataService) {}
  getMenuitem(): Menu[] {
    if (this.holdData.companyInfo){
      if (this.holdData.companyInfo.delivery) {
        return MENUITEMSORDERS;
      }else {
        return MENUITEMS;
      }
    }  else {
      return MENUITEMS;
    }
  }
}
