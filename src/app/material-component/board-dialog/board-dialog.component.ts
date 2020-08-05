import { Component, Inject } from '@angular/core';
import {  MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';

@Component({
  selector: 'app-board-dialog',
  templateUrl: './board-dialog.component.html'
})
export class BoardDialogComponent {
  action:string;
  local_data:any;
  isReadOnly:boolean;

  constructor(
    public dialogRef: MatDialogRef<BoardDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {
    // local_data receives data from the component in which this dialog was called
    this.local_data = {...data}
    this.action = this.local_data.action;

    if(this.action === 'view'){
      this.isReadOnly = true;
      this.local_data.timestamp = this.local_data.timestamp.toDate();
    }
  }

  onNoClick(): void {
    this.dialogRef.close({event: 'close'});
  }


  allowEdition(){
    this.isReadOnly = false;
  }


  editAnnouncement(){
    this.dialogRef.close({event: 'edit', data: this.local_data});
  }

  
  deleteAnnouncement(){
    this.dialogRef.close({event: 'delete'});
  }


  createAnnouncement(){
    this.dialogRef.close({event: 'create', data: this.local_data});
  }
}

