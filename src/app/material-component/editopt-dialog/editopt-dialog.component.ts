import { Component, OnInit, Inject } from '@angular/core';
import {  MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';

@Component({
  selector: 'app-editopt-dialog',
  templateUrl: './editopt-dialog.component.html',
  styleUrls: ['./editopt-dialog.component.scss']
})
export class EditOptDialogComponent implements OnInit {
  
  message: string;
  constructor(
    public dialogRef: MatDialogRef<EditOptDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any) {
      this.message = data;
     }

  ngOnInit(): void {
  }

  onNoClick(){
    this.dialogRef.close({event: 'close'});
  }

  updateOption(){
    this.dialogRef.close({event: 'data', message: this.message});
  }
}
