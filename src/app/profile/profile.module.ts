import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FlexLayoutModule } from '@angular/flex-layout';

import { ProfileRoutingModule } from './profile-routing.module';
import { ProfilepageComponent } from './profilepage/profilepage.component';

import { DemoMaterialModule } from '../demo-material-module';
import { FormsModule } from '@angular/forms';


@NgModule({
  declarations: [ProfilepageComponent],
  imports: [
    CommonModule,
    DemoMaterialModule,
    FlexLayoutModule,
    ProfileRoutingModule,
    FormsModule
  ]
})
export class ProfileModule { }
