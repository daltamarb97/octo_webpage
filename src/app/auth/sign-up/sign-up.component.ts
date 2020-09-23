import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { Router } from '@angular/router';

// services
import { AuthService } from '../../core/services/auth.service';
import { SetDataService } from '../../core/services/set-data.service';
import { AngularFireAuth } from '@angular/fire/auth';
import { FecthDataService } from '../../core/services/fecth-data.service';
import { DeleteDataService } from '../../core/services/delete-data.service';

export interface CompanyData {
  name: string,
  companyId: string
}

@Component({
  selector: 'app-sign-up',
  templateUrl: './sign-up.component.html',
  styleUrls: ['./sign-up.component.scss']
})
export class SignUpComponent implements OnInit {

  form: FormGroup;
  buttonInvalid: boolean = true;
  passwordsFirebaseCompany: Array<any> = [];

  constructor(
    private formBuilder: FormBuilder,
    private router: Router,
    private afa: AngularFireAuth,
    // services
    private authService: AuthService,
    private setDataService: SetDataService,
  ) {}

  ngOnInit(): void {
    // init forms
    this.buildForm();
  }

  signUp(event: Event){
    this.buttonInvalid = false;
    // Create user in Firebase Authentication database 
    if(this.form.valid){
      const formValue = this.form.value;
      this.authService.signUp(formValue.email, formValue.password)
      .then(()=>{
        this.buttonInvalid = true;
        // get last registered user from firebase Auth
        this.afa.onAuthStateChanged((user)=>{
          if(user){
            const personData = {
              name: this.form.get('name').value,
              lastname: this.form.get('lastname').value,
              email: this.form.get('email').value,
              userId: user.uid
            }
            this.setDataService.createNewUser(personData);
            this.router.navigate(['/auth/login']);
          }
        })
      }).catch(e => {
        this.buttonInvalid = true;
        alert('Tuvimos problemas creando tu cuenta, intentalo con credenciales diferentes');
      })
    } 
  }

  private buildForm(){
    // Creation of the registration formBuilder
    this.form = this.formBuilder.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      name: ['', [Validators.required]],
      lastname: ['', [Validators.required]],
    })
  }
}
