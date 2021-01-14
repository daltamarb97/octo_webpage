import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { ClosedchatsComponent } from './closedchats/closedchats.component';


const ClosedchatsRoutes: Routes = [
  {
    path: '',
    component: ClosedchatsComponent
  },
];

@NgModule({
  imports: [RouterModule.forChild(ClosedchatsRoutes)],
  exports: [RouterModule]
})
export class ClosedchatsRoutingModule { }
