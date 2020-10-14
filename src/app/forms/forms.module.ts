import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { FormsRoutingModule } from './forms-routing.module';
import { FormsTableComponent } from './forms-table/forms-table.component';

import { DemoMaterialModule } from '../demo-material-module';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { FlexLayoutModule } from '@angular/flex-layout';

@NgModule({
  declarations: [FormsTableComponent],
  imports: [
    CommonModule,
    FormsRoutingModule,
    DemoMaterialModule,
    FlexLayoutModule,
    FormsModule,
    ReactiveFormsModule,
  ]
})
export class FormModule { }
