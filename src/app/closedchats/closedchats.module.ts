import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FlexLayoutModule } from '@angular/flex-layout';
import { ClosedchatsRoutingModule } from './closedchats-routing.module';

import {  ClosedchatsComponent } from './closedchats/closedchats.component';
import { DemoMaterialModule } from '../demo-material-module';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

@NgModule({
  declarations: [ClosedchatsComponent],
  imports: [
    CommonModule,
    DemoMaterialModule,
    FlexLayoutModule,
    ClosedchatsRoutingModule,
    FormsModule,
    ReactiveFormsModule,
    
  ]
})
export class ClosedchatsModule { }
