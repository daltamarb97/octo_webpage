import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { OrderdetailsRoutingModule } from './orderdetails-routing.module';
import { OrderdetailsComponent } from './orderdetails/orderdetails.component';
import { DemoMaterialModule } from 'app/demo-material-module';
import { FlexLayoutModule } from '@angular/flex-layout';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { AccordionAnchorDirective } from 'app/shared/accordion';
import { NgxPrintModule } from 'ngx-print';


@NgModule({
  declarations: [OrderdetailsComponent],
  imports: [
    CommonModule,
    OrderdetailsRoutingModule,
    DemoMaterialModule,
    FlexLayoutModule,
    FormsModule,
    ReactiveFormsModule,
    NgxPrintModule

  ]
})
export class OrderdetailsModule { }
