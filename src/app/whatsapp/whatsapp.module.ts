import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FlexLayoutModule } from '@angular/flex-layout';
import { WhatsappRoutingModule } from './whatsapp-routing.module';

import {  WhatsappComponent } from './whatsapp/whatsapp.component';
import { DemoMaterialModule } from '../demo-material-module';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

@NgModule({
  declarations: [WhatsappComponent],
  imports: [
    CommonModule,
    DemoMaterialModule,
    FlexLayoutModule,
    WhatsappRoutingModule,
    FormsModule,
    
  ]
})
export class WhatsappComponentModule { }
