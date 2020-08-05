import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { DirectoryRoutingModule } from './directory-routing.module';
import { DirectoryComponent } from './directory/directory.component';
import { DemoMaterialModule } from '../demo-material-module';


@NgModule({
  declarations: [DirectoryComponent],
  imports: [
    CommonModule,
    DirectoryRoutingModule,
    DemoMaterialModule
  ]
})
export class DirectoryModule { }
