import { Component, Inject } from '@angular/core';
import {  MatDialogRef, MAT_DIALOG_DATA, MAT_CHIPS_DEFAULT_OPTIONS } from '@angular/material';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';


@Component({
  selector: 'app-board-dialog',
  templateUrl: './board-dialog.component.html',
  styleUrls: ['./board-dialog.component.scss']
})
export class BoardDialogComponent {
  action:string;
  local_data: any;
  isReadOnly:boolean;
  fileInfo:string;
  TaskForm: FormGroup;

  constructor(
    public dialogRef: MatDialogRef<BoardDialogComponent>,
    private formBuilder: FormBuilder,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {
    this.buildForm();
  }

  onNoClick(): void {
    this.dialogRef.close({event: 'close'});
  }

  createTask() {
    this.local_data = this.TaskForm.value;
    this.dialogRef.close({event: 'create', data: this.local_data});
  }

  addfile(event){
    if(event.target.files.length > 0) {
      this.fileInfo = event.target.files[0];
      this.TaskForm.patchValue({
        file: this.fileInfo
      }); 
    }
  }

  private buildForm(){
    // build the login in form
    this.TaskForm = this.formBuilder.group({
      title: ['', [Validators.required]],
      details: ['', [Validators.required]],
      date: ['', [Validators.required]],
      assigned: ['', [Validators.required]],
      file: [null],
    })
  }
}

