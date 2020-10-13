import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { TicketsListComponent } from './tickets-list/tickets-list.component';

const TicketsRoutes: Routes = [
  {
    path: '',
    component: TicketsListComponent
  },
];

@NgModule({
  imports: [RouterModule.forChild(TicketsRoutes)],
  exports: [RouterModule]
})
export class TicketsRoutingModule { }
