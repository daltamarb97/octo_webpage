import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { MatSnackBarHorizontalPosition, 
  MatSnackBarVerticalPosition, 
  MatSnackBar
} from '@angular/material';

import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-pass-reset',
  templateUrl: './pass-reset.component.html',
  styleUrls: ['./pass-reset.component.scss']
})
export class PassResetComponent implements OnInit {

  passResetForm: FormGroup;
  // snackbar variables
  horizontalPosition: MatSnackBarHorizontalPosition = 'center';
  verticalPosition: MatSnackBarVerticalPosition = 'bottom';
  // variable to control html
  showInput:boolean = true;

  constructor(
    private formBuilder: FormBuilder,
    private _snackBar: MatSnackBar,
    // services
    private authService: AuthService
  ) { }

  ngOnInit(): void {
    this.buildForm();
  }

  resetPass(){
    // resetting password given an email
    if(this.passResetForm.valid){
      const formValue = this.passResetForm.value;
      this.authService.resetPassword(formValue.email)
      .then(() => this.showInput = false)
      .catch(err => {
        if(
          err.code === 'auth/user-not-found' || 
          err.code === 'auth/invalid-email'
        ){
          this._snackBar.open('No encontramos tu correo, intenta de nuevo', 'Cerrar', {
            duration: 2000,
            horizontalPosition: this.horizontalPosition,
            verticalPosition: this.verticalPosition,
          });
        }
      })
    }
  }

  private buildForm(){
    // build the login in form
    this.passResetForm = this.formBuilder.group({
      email: ['', [Validators.required]]
    });
  }

}
