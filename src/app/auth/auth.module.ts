import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';

import { AuthRoutingModule } from './auth-routing.module';
import { SignUpComponent } from './sign-up/sign-up.component';
import { DemoMaterialModule } from '../demo-material-module';
import { LoginComponent } from './login/login.component';
import { FlexLayoutModule } from '@angular/flex-layout';
import { PassResetComponent } from './pass-reset/pass-reset.component';



@NgModule({
  declarations: [SignUpComponent, LoginComponent, PassResetComponent],
  imports: [
    CommonModule,
    AuthRoutingModule,
    DemoMaterialModule,
    ReactiveFormsModule,
    FlexLayoutModule
  ]
})
export class AuthModule { }
