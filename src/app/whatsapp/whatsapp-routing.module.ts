import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { WhatsappComponent } from './whatsapp/whatsapp.component';


const WhatsappComponentRoutes: Routes = [
  {
    path: '',
    component: WhatsappComponent
  },
];

@NgModule({
  imports: [RouterModule.forChild(WhatsappComponentRoutes)],
  exports: [RouterModule]
})
export class WhatsappRoutingModule { }
