import 'hammerjs';
import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { HttpClientModule } from '@angular/common/http';
import { CommonModule } from '@angular/common';

import { DemoMaterialModule } from '../demo-material-module';
import { CdkTableModule } from '@angular/cdk/table';

import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { FlexLayoutModule } from '@angular/flex-layout';

import { MaterialRoutes } from './material.routing';

import { DialogOverviewComponent} from './dialog/dialog.component';
import { ChatCreationDialogComponent } from './chat-creation-dialog/chat-creation-dialog.component';
import { BoardDialogComponent } from './board-dialog/board-dialog.component';
import { ProfileDialogComponent } from './profile-dialog/profile-dialog.component';
import { InviteDialogComponent } from './invite-dialog/invite-dialog.component';
import { HelpDialogComponent } from './help-dialog/help-dialog.component';
import { CategoryComponent } from './category-dialog/category-dialog.component';
import { OptionComponent } from './option-dialog/option-dialog.component';
import { MessageComponent } from './message-dialog/message-dialog.component';
import { QuickResponsesDialogComponent } from './quick-responses-dialog/quick-responses-dialog.component';
import { EditOptDialogComponent } from './editopt-dialog/editopt-dialog.component';
import { TicketDialogComponent } from './ticket-dialog/ticket-dialog.component';

@NgModule({
  imports: [
    CommonModule,
    RouterModule.forChild(MaterialRoutes),
    DemoMaterialModule,
    HttpClientModule,
    FormsModule,
    ReactiveFormsModule,
    FlexLayoutModule,
    CdkTableModule
  ],
  providers: [],
  entryComponents: [DialogOverviewComponent, ChatCreationDialogComponent],
  declarations: [
    DialogOverviewComponent,
    ChatCreationDialogComponent,
    BoardDialogComponent,
    ProfileDialogComponent,
    EditOptDialogComponent,
    InviteDialogComponent,
    HelpDialogComponent,
    CategoryComponent,
    OptionComponent,
    MessageComponent,
    QuickResponsesDialogComponent,
    TicketDialogComponent
  ]
})
export class MaterialComponentsModule {}
