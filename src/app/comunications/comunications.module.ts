import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FlexLayoutModule } from '@angular/flex-layout';

import { ComunicationsRoutingModule } from './comunications-routing.module';
import { ComunicationsComponent } from './comunications/comunications.component';
import { DemoMaterialModule } from '../demo-material-module';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

@NgModule({
  declarations: [ComunicationsComponent],
  imports: [
    CommonModule,
    DemoMaterialModule,
    FlexLayoutModule,
    ComunicationsRoutingModule,
    FormsModule,
    
  ]
})
export class ComunicationsModule { }
