import { Component, Inject } from '@angular/core';
import {  MatDialogRef, 
          MAT_DIALOG_DATA, 
} from '@angular/material/dialog';
import {
  MatSnackBar, 
  MatSnackBarHorizontalPosition, 
  MatSnackBarVerticalPosition 
} from '@angular/material/snack-bar';

declare var Mercadopago: any;

@Component({
  selector: 'app-profile-dialog',
  templateUrl: './profile-dialog.component.html',
  styleUrls: ['./profile-dialog.component.scss']
})
export class ProfileDialogComponent{

  action: string;
  local_data:any;
  horizontalPosition: MatSnackBarHorizontalPosition = 'center';
  verticalPosition: MatSnackBarVerticalPosition = 'bottom';
  identificationTypes:any; 

  constructor(
    public dialogRef: MatDialogRef<ProfileDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private _snackBar: MatSnackBar
  ) { 
    // local_data receives data from the component in which this dialog was called
    this.local_data = {... data};
    this.action = this.local_data.action;
    Mercadopago.setPublishableKey('TEST-ec744827-65a8-46dc-ba7b-a7f039113526');
    this.identificationTypes = Mercadopago.getIdentificationTypes();
    console.log(this.identificationTypes);
    
  }


  onNoClick(){
    this.action = 'cancel'
    this.dialogRef.close({event: this.action});
  }

  createDoormanAccount(){
    if(!this.local_data.email || !this.local_data.password){
      this._snackBar.open('Te falta información para crear la cuenta', 'Cerrar', {
        duration: 1500,
        horizontalPosition: this.horizontalPosition,
        verticalPosition: this.verticalPosition,
      });
    }else{
      this.dialogRef.close({data: this.local_data, event: this.action});
    }
  }

  copyMessage(){
    // logic for copying payment link
    const selBox = document.createElement('textarea');
    selBox.style.position = 'fixed';
    selBox.style.left = '0';
    selBox.style.top = '0';
    selBox.style.opacity = '0';
    selBox.value = this.local_data.paymentLink;
    document.body.appendChild(selBox);
    selBox.focus();
    selBox.select();
    document.execCommand('copy');
    document.body.removeChild(selBox);
  }


}

