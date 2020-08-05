import { Component, OnInit, Inject } from '@angular/core';
import {  MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';

@Component({
  selector: 'app-excel-dialog',
  templateUrl: './excel-dialog.component.html',
  styleUrls: ['./excel-dialog.component.css']
})
export class ExcelDialogComponent implements OnInit {

  constructor(
    public dialogRef: MatDialogRef<ExcelDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any) { }

  ngOnInit(): void {
  }

}
