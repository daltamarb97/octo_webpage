import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { TagMetricsRoutingModule } from './tag-metrics-routing.module';
import { TagMetricsComponent } from './tag-metrics/tag-metrics.component';
import { FlexLayoutModule } from '@angular/flex-layout';

import { DemoMaterialModule } from '../demo-material-module';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NgxChartsModule } from '@swimlane/ngx-charts';

@NgModule({
  declarations: [TagMetricsComponent],
  imports: [
    CommonModule,
    TagMetricsRoutingModule,
    DemoMaterialModule,
    FormsModule,
    FlexLayoutModule,
    NgxChartsModule,
    



  ]
})
export class TagMetricsModule { }
