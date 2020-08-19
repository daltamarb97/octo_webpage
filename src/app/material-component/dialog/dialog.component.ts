import { Component, Inject } from '@angular/core';
import {  MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';

@Component({
  selector: 'app-dialog-overview',
  templateUrl: './dialog-overview.html'
})
export class DialogOverviewComponent {

  action:string;
  local_data:any;

  constructor(
    public dialogRef: MatDialogRef<DialogOverviewComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {
    // local_data receives data from the component in which this dialog was called
    this.local_data = {...data},
    this.action = this.local_data.action;
  }

  doAction(){
    this.dialogRef.close({event: this.action, data: this.local_data});
  }


  closeDialog(): void {
    this.dialogRef.close({event: 'Cancel'});
  }
}

