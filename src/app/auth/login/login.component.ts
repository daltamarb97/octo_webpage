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
    console.log('me destrui');
  }


  logIn(event: Event){
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
          if(this.holdData.userInfo.isAdmin !== true){
            // if user is not admin automatically log them out in order to execute guards
            alert('sólo puedes ingresar si tienes perfil de administrador')
            this.authService.logOut();
          }else if(result.user.emailVerified !== true){
            // email verification required
            alert('por favor verifica el correo de la administración para ingresar');
          }else{
            // allow user to login
            this.router.navigate(['/'])
            console.log(result.user);  
          }
        })
      }).catch(error =>{
        // incorrect credentials
        if(
          error.code === "auth/wrong-password" || 
          error.code === "auth/user-not-found" ||
          error.code === "auth/invalid-email" 
        ){
          alert('email o contraseña incorrectos');
        }else{
          console.log(error);
          alert('ocurrió un problema, contáctanos a xxxxx@gmail.com');
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
