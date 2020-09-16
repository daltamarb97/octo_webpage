import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { ChatFlowRoutingModule } from './chat-flow-routing.module';
import { ChatFlowComponent } from './chat-flow/chat-flow.component';
import { DemoMaterialModule } from 'app/demo-material-module';
import { FlexLayoutModule } from '@angular/flex-layout';
import {DragDropModule} from '@angular/cdk/drag-drop';


@NgModule({
  declarations: [ChatFlowComponent],
  imports: [
    CommonModule,
    ChatFlowRoutingModule,
    DemoMaterialModule,
    FlexLayoutModule,
    
    
  ]
})
export class ChatFlowModule { }
