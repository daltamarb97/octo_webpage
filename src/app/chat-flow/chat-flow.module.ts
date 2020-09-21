import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { ChatFlowRoutingModule } from './chat-flow-routing.module';
import { ChatFlowComponent } from './chat-flow/chat-flow.component';
import { DemoMaterialModule } from '../demo-material-module';
import { FlexLayoutModule } from '@angular/flex-layout';
import { FormsModule } from '@angular/forms';


@NgModule({
  declarations: [ChatFlowComponent],
  imports: [
    CommonModule,
    ChatFlowRoutingModule,
    DemoMaterialModule,
    FlexLayoutModule,
    FormsModule,
    
  ]
})
export class ChatFlowModule { }
