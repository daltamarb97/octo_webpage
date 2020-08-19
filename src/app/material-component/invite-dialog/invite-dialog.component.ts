import { Component, Inject } from '@angular/core';
import {  MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';

@Component({
  selector: 'app-invite-dialog',
  templateUrl: './invite-dialog.component.html'
})
export class InviteDialogComponent {
  value: string;
  constructor(
    public dialogRef: MatDialogRef<InviteDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {}

  onNoClick(): void {
    this.dialogRef.close({event: 'close'});
  }


  confirmEmails() {
    const dirtyEmails = this.value.split(',');
    let cleanEmails: Array<string> = [];
    dirtyEmails.forEach(e => cleanEmails.push(e.trim())); 
    const rta = cleanEmails.filter(e => {
      if (e.length !== 0) {
        return e
      }
    });
    this.dialogRef.close({event: 'emails', data: rta});
  }
}

