import { Component, OnInit } from '@angular/core';
import { 
        MatSnackBarHorizontalPosition, 
        MatSnackBarVerticalPosition, 
        MatSnackBar
      } from '@angular/material/snack-bar';
import {MatDialog} from '@angular/material/dialog';

import { ProfileDialogComponent } from '../../material-component/profile-dialog/profile-dialog.component';

import { SetDataService } from '../../core/services/set-data.service';
import { HoldDataService } from '../../core/services/hold-data.service';
import { FecthDataService } from '../../core/services/fecth-data.service';
import { AuthService } from '../../core/services/auth.service';
import { DeleteDataService } from '../../core/services/delete-data.service';

import { takeUntil } from 'rxjs/operators';
import { Subject } from 'rxjs';
import { Router } from '@angular/router';



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
    private authData: AuthService,
    private router: Router,


  ) { }


  ngOnInit(): void {    
    this.user = this.holdData.userInfo;
    this.companyInfo = this.holdData.companyInfo;
    this.paymentLink = this.holdData.companyInfo.paymentLink;
    this.companyPassword = this.holdData.companyInfo.companyPassword;
  }


  ngOnDestroy(){
    this.destroy$.next();
    this.destroy$.complete();
  }

  changeProfilePic(){
    console.log('hice click');
    
  }

  logOut(){
    // logging out and redirecting to login
    this.authData.logOut()
    .then(()=>{
      this.router.navigate(['/auth/login']);
    });
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
