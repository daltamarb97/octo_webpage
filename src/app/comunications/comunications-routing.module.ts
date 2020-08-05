import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { ComunicationsComponent } from './comunications/comunications.component';


const ComunicationsRoutes: Routes = [
  {
    path: '',
    component: ComunicationsComponent
  },
];

@NgModule({
  imports: [RouterModule.forChild(ComunicationsRoutes)],
  exports: [RouterModule]
})
export class ComunicationsRoutingModule { }
