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
import { ExcelDialogComponent } from './excel-dialog/excel-dialog.component';

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
    ExcelDialogComponent,
  ]
})
export class MaterialComponentsModule {}
