import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { TagMetricsComponent } from './tag-metrics/tag-metrics.component';


const routes: Routes = [
  {
    path: '',
    component: TagMetricsComponent
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class TagMetricsRoutingModule { }
