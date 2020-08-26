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
import { Router, NavigationExtras } from '@angular/router';



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
  proyects: Array<any> = [];
  // snackbar variables
  horizontalPosition: MatSnackBarHorizontalPosition = 'center';
  verticalPosition: MatSnackBarVerticalPosition = 'bottom';
  constructor(
    private dialog: MatDialog,
    // services
    private setData: SetDataService,
    private holdData: HoldDataService,
    private fetchData: FecthDataService,
    private authData: AuthService,
    private router: Router,
  ) { }


  ngOnInit(): void {   
    if (!this.holdData.companyInfo) {
      this.router.navigate(['no-comp'])
    } 
    this.user = this.holdData.userInfo;
    this.companyInfo = this.holdData.companyInfo;
    this.paymentLink = this.holdData.companyInfo.paymentLink;
    this.getProyects();
  }


  ngOnDestroy(){
    this.destroy$.next();
    this.destroy$.complete();
  }

  logOut(){
    // logging out and redirecting to login
    this.authData.logOut()
    .then(()=>{
      this.router.navigate(['/auth/login']);
    });
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

  private async getProyects () {
    // get all proyects of user
    await this.fetchData.getProyects(this.holdData.userId)
      .subscribe(data => {
        data.forEach(d => {
          this.proyects.push(d.data())
        })
      })
  }

  async changeProyect(companyId){
    //   change companyId and refresh site
    await this.setData.updateCompanyIdInUser(this.holdData.userId, companyId);
    this.router.navigate(['inicio']);
  }

  addProyect(){
    let navigationExtras: NavigationExtras = {
      state: {new: true}
    };
    this.router.navigate(['no-comp'], navigationExtras);
  }
}
