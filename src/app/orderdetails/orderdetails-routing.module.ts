import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { OrderdetailsComponent } from './orderdetails/orderdetails.component';

const routes: Routes = [{
  path: '',
  component: OrderdetailsComponent
},
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class OrderdetailsRoutingModule { }
