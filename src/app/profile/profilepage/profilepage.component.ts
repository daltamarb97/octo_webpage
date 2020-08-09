import { Component, OnInit } from '@angular/core';
import { MatDialog, 
        MatSnackBarHorizontalPosition, 
        MatSnackBarVerticalPosition, 
        MatSnackBar
      } from '@angular/material';

import { ProfileDialogComponent } from '../../material-component/profile-dialog/profile-dialog.component';

import { SetDataService } from '../../core/services/set-data.service';
import { HoldDataService } from '../../core/services/hold-data.service';
import { FecthDataService } from '../../core/services/fecth-data.service';
import { AuthService } from '../../core/services/auth.service';
import { DeleteDataService } from '../../core/services/delete-data.service';

import { takeUntil } from 'rxjs/operators';
import { Subject } from 'rxjs';



@Component({
  selector: 'app-profilepage',
  templateUrl: './profilepage.component.html',
  styleUrls: ['./profilepage.component.scss']
})
export class ProfilepageComponent implements OnInit {

  destroy$: Subject<void> = new Subject()
  doormanList:Array<any> = []; 
  companyPassword:string;
  paymentLink:string;
  showAddDoormanButton:boolean = true;
  user:any; 
  companyInfo:any;
  // snackbar variables
  horizontalPosition: MatSnackBarHorizontalPosition = 'center';
  verticalPosition: MatSnackBarVerticalPosition = 'bottom';
  constructor(
    private dialog: MatDialog,
    private _snackBar: MatSnackBar,
    // services
    private setData: SetDataService,
    private holdData: HoldDataService,
    private fetchData: FecthDataService,
    private deleteData: DeleteDataService,
    private authData: AuthService
  ) { }


  ngOnInit(): void {    
    this.getDoormanInfo();
    console.log(this.holdData.userInfo);
    
    this.user = this.holdData.userInfo;
    this.companyInfo = this.holdData.companyInfo;
    this.paymentLink = this.holdData.companyInfo.paymentLink;
    this.companyPassword = this.holdData.companyInfo.companyPassword;
  }


  ngOnDestroy(){
    this.destroy$.next();
    this.destroy$.complete();
  }


  getDoormanInfo(){
    // gets initial data of doorman
    this.fetchData.getBuidlingEmployees(this.holdData.companyInfo.companyId)
    .pipe(
      takeUntil(this.destroy$)
    )
    .subscribe(doorman => {
      doorman.map(data => {
        const dataDoorman = data.payload.doc.data();
        this.doormanList.push(dataDoorman);
      })
      if(this.doormanList.length > 0){
        this.showAddDoormanButton = false;
      }
    })
  }


  changeProfilePic(){
    console.log('hice click');
    
  }

  deleteDoormanAccount(data){
    // disable doorman account
    this.deleteData.disableDoormanAccountFromDB(this.holdData.companyInfo.companyId, data.doormanId);
    this.doormanList.pop();
    this.showAddDoormanButton = true;
  }


  copyMessage(){
    // logiv to copy the building password
    const selBox = document.createElement('textarea');
    selBox.style.position = 'fixed';
    selBox.style.left = '0';
    selBox.style.top = '0';
    selBox.style.opacity = '0';
    selBox.value = this.companyPassword;
    document.body.appendChild(selBox);
    selBox.focus();
    selBox.select();
    document.execCommand('copy');
    document.body.removeChild(selBox);
  }

  
  addDoorman(){
    // add a new doorman
    let data = {
      action: 'doorman'
    }
    const dialogRef = this.dialog.open(ProfileDialogComponent, {data: data})
    
    dialogRef.afterClosed().subscribe(result => {
      if(result.event === data.action){
        const dataResult = result.data; 
        // check if doorman account already exists
        this.authData.checkIfDoormanEmailExists(dataResult.email)
        .then(res => {
          if(res.length > 0){
            // email alredy exists
            this._snackBar.open('El correo que registraste ya existe', 'Cerrar', {
              duration: 2000,
              horizontalPosition: this.horizontalPosition,
              verticalPosition: this.verticalPosition,
            });
          }else{
            // create doorman account
            this.createDoormanAccount(dataResult);
            this._snackBar.open('Correo registrado exitosamente', 'Cerrar', {
              duration: 2000,
              horizontalPosition: this.horizontalPosition,
              verticalPosition: this.verticalPosition,
            });
          }
        })
        .catch(err => {
          // email is badly formatted, invalid for firebase
          if(err.code === 'auth/invalid-email'){
            this._snackBar.open('El correo que pusiste parece no existir, volver a registrar', 'Cerrar', {
              duration: 2000,
              horizontalPosition: this.horizontalPosition,
              verticalPosition: this.verticalPosition,
            });
          }
        })
      }
    })
  }


  goToPaymentLink(){
    // re-direct user to the payment link
    let data = {
      action: 'paymentLink',
      paymentLink: this.paymentLink
    }
    const dialogRef = this.dialog.open(ProfileDialogComponent, {data: data})
  }

  
  private createDoormanAccount(data){
    // call firebase function of doorman account creation
    const doormanData: object = {
      email: data.email,
      password: data.password,
      name: `Portería ${this.holdData.companyInfo.name}`,
    }
    this.setData.doormanCreationTrigger(this.holdData.companyInfo.companyId, doormanData);
  }
}
