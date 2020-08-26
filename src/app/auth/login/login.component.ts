import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';

// services
import { AuthService } from '../../core/services/auth.service';
import { FecthDataService } from '../../core/services/fecth-data.service';
import { HoldDataService } from '../../core/services/hold-data.service';


import { takeUntil } from 'rxjs/operators';
import { Subject } from 'rxjs';


@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit {

  loginForm: FormGroup;
  destroy$: Subject<void> = new Subject();
  buttonInvalid: boolean = true;
  constructor(
    private formBuilder: FormBuilder,
    private router: Router,
    // services
    private authService: AuthService,
    private fetchData: FecthDataService,
    private holdData: HoldDataService
  ) { 
    this.buildForm();
  }

  ngOnInit(): void {
  }


  ngOnDestroy(){
    this.destroy$.next();
    this.destroy$.complete();
  }


  logIn(event: Event){
    this.buttonInvalid = false;
    // logging in with email and password
    if(this.loginForm.valid){
      const formValue = this.loginForm.value;
      this.authService.logIn(formValue.email, formValue.password)
      .then((result)=>{
        // get user info to check isAdmin property
        this.fetchData.getUserInfo(result.user.uid)
        .pipe(
          takeUntil(this.destroy$)
        )
        .subscribe((user)=>{
          this.holdData.userInfo = user;
          if(result.user.emailVerified !== true){
            this.buttonInvalid = true;
            // email verification required
            alert('por favor verifica tu email para ingresar');
            this.authService.logOut();
          }else{
            this.buttonInvalid = true;
            // allow user to login
            this.router.navigate(['/no-comp'])  
          }
        })
      }).catch(error =>{
        this.buttonInvalid = true;
        // incorrect credentials
        if(
          error.code === "auth/wrong-password" || 
          error.code === "auth/user-not-found" ||
          error.code === "auth/invalid-email" 
        ){
          alert('email o contraseña incorrectos');
        }else{
          alert('ocurrió un problema, contáctanos a waypooltec@gmail.com');
        }
      })
    }
  } 


  private buildForm(){
    // build the login in form
    this.loginForm = this.formBuilder.group({
      email: ['', [Validators.required]],
      password: ['', [Validators.required]]
    })
  }

}
