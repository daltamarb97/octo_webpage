import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

import { FecthDataService } from '../../core/services/fecth-data.service';
import { HoldDataService } from '../../core/services/hold-data.service';
import { SetDataService } from '../../core/services/set-data.service';
import { InviteDialogComponent } from '../../material-component/invite-dialog/invite-dialog.component';
import { MatDialog, MatSnackBarHorizontalPosition, MatSnackBarVerticalPosition, MatSnackBar } from '@angular/material';

@Component({
  selector: 'app-directory',
  templateUrl: './directory.component.html',
  styleUrls: ['./directory.component.scss']
})
export class DirectoryComponent implements OnInit {
  user:any;
  residents :Array<any> = [];
  emergency :Array<any> = [];
  others :Array<any> = [];
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
    this.user= this.holdData.userInfo;
    this.companyInfo = this.holdData.companyInfo;
    this.getInfoDirectoryEmergency();
    this.getInfoDirectoryOthers();
    this.getInfoDirectoryResidents();
  }

  private getInfoDirectoryResidents() {
    this.fecthDataService.getDirectory(this.user.companyId, 'residents')
      .subscribe( res => {
        res.map(r => {
          const data = r.payload.doc.data();
          this.residents.push(data);
        })
      });
  }

  private getInfoDirectoryEmergency() {
    this.fecthDataService.getDirectory(this.user.companyId, 'emergency')
      .subscribe( res => {
        res.map(r => {
          const data = r.payload.doc.data();
          this.emergency.push(data);
        })
      });
  }

  private getInfoDirectoryOthers() {
    this.fecthDataService.getDirectory(this.user.companyId, 'others')
      .subscribe( res => {
        res.map(r => {
          const data = r.payload.doc.data();
          this.others.push(data);
        })
      });
  }

  
  chat(person){  
    // verifying the user already have a conversation with the person
   this.fecthDataService.getPrivateChatKey(this.user.userId,person.userId)
    .subscribe( res => {
      if (res.data()) {
        this.router.navigate(['/canales-comunicacion']);
      } else {
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
          .then(() => {
            this.router.navigate(['/canales-comunicacion']);
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
          company: companyName
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
