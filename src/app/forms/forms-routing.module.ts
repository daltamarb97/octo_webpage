import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { FormsTableComponent } from '../forms/forms-table/forms-table.component';

const FormsRoutes: Routes = [
  {
    path: '',
    component: FormsTableComponent
  },
];

@NgModule({
  imports: [RouterModule.forChild(FormsRoutes)],
  exports: [RouterModule]
})
export class FormsRoutingModule { }
