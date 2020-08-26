import { Component, OnInit } from '@angular/core';
import { Router, NavigationExtras } from '@angular/router';

import { FecthDataService } from '../../core/services/fecth-data.service';
import { HoldDataService } from '../../core/services/hold-data.service';
import { SetDataService } from '../../core/services/set-data.service';
import { InviteDialogComponent } from '../../material-component/invite-dialog/invite-dialog.component';
import {  MatSnackBarHorizontalPosition, MatSnackBarVerticalPosition, MatSnackBar } from '@angular/material/snack-bar';
import {MatDialog} from '@angular/material/dialog';


@Component({
  selector: 'app-directory',
  templateUrl: './directory.component.html',
  styleUrls: ['./directory.component.scss']
})
export class DirectoryComponent implements OnInit {
  user:any;
  employees :Array<any> = [];
  keyChats:any;
  companyInfo: any;
  // snackbar variables
  horizontalPosition: MatSnackBarHorizontalPosition = 'center';
  verticalPosition: MatSnackBarVerticalPosition = 'bottom';

  constructor(
    private fecthDataService:FecthDataService,
    private setData: SetDataService,
    private holdData:HoldDataService,
    // angular stuff
    private dialog: MatDialog,
    private router: Router,
    private _snackBar: MatSnackBar,
    ) {}

  ngOnInit(): void {
    if (!this.holdData.companyInfo) {
      this.router.navigate(['no-comp'])
    }
    this.user= this.holdData.userInfo;
    this.companyInfo = this.holdData.companyInfo;
    this.getInfoDirectory();
  }

  getInfoDirectory() {
    this.fecthDataService.getCompanyEmployees(this.companyInfo.companyId)
      .subscribe(data => {
        data.map(e => {
          const data = e.payload.doc.data(); 
          this.employees.push(data);
        })
      })
  }
  
  
  chat(person){ 
    // verifying the user already have a conversation with the person
   this.fecthDataService.getPrivateChatKey(this.user.userId,person.userId)
    .subscribe( res => {
      if (res.data()) {
        let navigationExtras: NavigationExtras = {
          state: {
            dirChat: res.data()          }
        };
        this.router.navigate(['/canales-comunicacion'],navigationExtras);
      } else {
        //if the person doesnt have a chat then create chat
        const localData = {
          userId: this.user.userId,
          name: this.user.name,
          lastname: this.user.lastname,
        }
        const foreignData = {
          userId: person.userId,
          name: person.name,
          lastname: person.lastname,
        }
        this.setData.createPrivateChat(localData, foreignData)
          .then((res) => {
            let navigationExtras: NavigationExtras = {
              state: {
                dirChat: res
              }
            };
            this.router.navigate(['/canales-comunicacion'],navigationExtras);
          })
      }
    });
 }


 invitePeople(){
  const dialogRef = this.dialog.open(InviteDialogComponent);

  dialogRef.afterClosed().subscribe(result => {
    if (result.event !== 'close') {
      // invite emails logic
      const hostEmail = this.holdData.userInfo.email;
      const companyName = this.holdData.companyInfo.name;
      result.data.forEach(email => {
        const data = {
          hostEmail: hostEmail,
          guestEmail: email,
          company: companyName,
          companyId: this.holdData.companyInfo.companyId,
        }
        this.setInviteEmail(data);
        this._snackBar.open('Invitaciones enviadas!', 'Cerrar', {
          duration: 2000,
          horizontalPosition: this.horizontalPosition,
          verticalPosition: this.verticalPosition,
        });
      });
    }
  })
 }

 private setInviteEmail (data) {
  //  set invite email in firebase
  this.setData.setInviteEmails(data);
 }
}
