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

  form0: FormGroup;
  form1: FormGroup;
  buttonInvalid: boolean = true;
  passwordsFirebaseCompany: Array<any> = [];

  constructor(
    private formBuilder: FormBuilder,
    private router: Router,
    private afa: AngularFireAuth,
    // services
    private authService: AuthService,
    private setDataService: SetDataService,
    private fetchDataService: FecthDataService,
    private deleteDataService: DeleteDataService,
  ) {
    
  }

  ngOnInit(): void {
    // init forms
    this.buildFormNewCompany();
    this.buildFormOldCompany();
  }

  
  signUp0(event: Event){
    this.buttonInvalid = false;
    // Create user in Firebase Authentication database 
    if(this.form0.valid){
      const formValue = this.form0.value;
      this.authService.signUp(formValue.email, formValue.password)
      .then(()=>{
        // get last registered user from firebase Auth
        this.afa.onAuthStateChanged((user)=>{
          if(user){
            const comapnyData = {
              name: this.form0.get('company').value,
            }
    
            const personData = {
              name: this.form0.get('name').value,
              lastname: this.form0.get('lastname').value,
              email: this.form0.get('email').value,
              userId: user.uid
            }
            
            this.setDataService.setNewCompany(comapnyData, personData);
            this.router.navigate(['/auth/login'])
          }
        })
      }).catch(e => {
        console.error(e);
        alert('tuvimos problemas creando tu cuenta, intentalo más tarde')
      })
    } 
  }

  // disableButton(){
  //   console.log('hola');
    
  //   this.buttonInvalid = false;
  // }

  signUp1(event: Event){
    this.buttonInvalid = false;
    // Create user in Firebase Authentication database 
    if(this.form1.valid){
      const formValue = this.form1.value;
      const inviteCode = this.form1.get('inviteCode').value;
      const emailCheck = this.form1.get('email').value;
      this.inviteCodeCheck(inviteCode, emailCheck)
        .then(data => {
          const companyData: any = data;
          this.authService.signUp(formValue.email, formValue.password)
            .then(()=>{
              // get last registered user from firebase Auth
              this.afa.onAuthStateChanged((user)=>{
                if(user){
                  const personData = {
                    name: this.form1.get('name').value,
                    lastname: this.form1.get('lastname').value,
                    email: this.form1.get('email').value,
                    userId: user.uid
                  }
                  // get default chat rooms
                  this.fetchDataService.getDefaultChats(companyData.companyId)
                    .subscribe(data => {
                      const rta = data.docs.map(r => r.data());
                      const filteredData = rta.filter(d => d.isDefault === true);
                      console.log(filteredData);
                      
                      this.setDataService.createNewUserAfterCompany(personData, companyData, filteredData );
                      this.router.navigate(['/auth/login']);
                    })
                }
              })
            })
            .catch(e => {
              console.error(e);
              alert('tuvimos problemas creando tu cuenta, intentalo más tarde')
            })
        })
        .catch(e => {
          alert(e);
        })  
    } 
  }


  private buildFormNewCompany(){
    // Creation of the registration formBuilder
    this.form0 = this.formBuilder.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      company: ['', [Validators.required]],
      name: ['', [Validators.required]],
      lastname: ['', [Validators.required]],
    })
  }

  private buildFormOldCompany(){
    // Creation of the registration formBuilder
    this.form1 = this.formBuilder.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      name: ['', [Validators.required]],
      lastname: ['', [Validators.required]],
      inviteCode: ['', [Validators.required]]
    })
  }


  private inviteCodeCheck(invite: any, email: any) {
    // get companies passwords to check if the password that user is referencing is correct
    return new Promise((resolve, reject) => {
      this.fetchDataService.getInviteCodes()
      .subscribe(data => {
        const rta = data.docs.map (d => d.data());
        for (let i in rta) {
          if (rta[i].inviteId === invite && rta[i].guestEmail === email) {
            // delete invite if found one
            this.deleteDataService.deleteInviteAfterSignup(rta[i].inviteId);
            resolve(rta[i]);
            break;
          }
        }
        reject('No se ha encontrado código de invitación asociado a tu email')
      })
    })
  }

}
