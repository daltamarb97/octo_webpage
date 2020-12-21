import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { OrdersComponent } from './orders/orders.component';

const OrdersRoutes: Routes = [
  {
    path: '',
    component: OrdersComponent
  },
];

@NgModule({
  imports: [RouterModule.forChild(OrdersRoutes)],
  exports: [RouterModule]
})
export class OrdersRoutingModule { }
