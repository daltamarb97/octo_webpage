import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { DirectoryComponent } from './directory/directory.component';


const DirectoryRoutes: Routes = [
  {
    path: '',
    component: DirectoryComponent
  },
];
@NgModule({
  imports: [RouterModule.forChild(DirectoryRoutes)],
  exports: [RouterModule]
})
export class DirectoryRoutingModule { }
