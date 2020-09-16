import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { ChatFlowComponent } from './chat-flow/chat-flow.component';


const routes: Routes = [
  {
    path: '',
    component: ChatFlowComponent
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ChatFlowRoutingModule { }
