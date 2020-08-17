import { Component, Inject } from '@angular/core';
import {  MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
// services
import { FecthDataService } from '../../core/services/fecth-data.service';
import { HoldDataService } from '../../core/services/hold-data.service';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';


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
  employees: Array<any> = [];
  destroy$: Subject<void> = new Subject();
  constructor(
    public dialogRef: MatDialogRef<BoardDialogComponent>,
    private formBuilder: FormBuilder,
    private fetchData: FecthDataService,
    private holdData: HoldDataService,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {
    this.buildForm();
    this.getInfoEmployees();
  }

  onNoClick(): void {
    this.destroy$.next();
    this.destroy$.complete();
    this.dialogRef.close({event: 'close'});
  }

  private getInfoEmployees() {
    this.fetchData.getCompanyEmployees(this.holdData.companyInfo.companyId)
      .pipe(
        takeUntil(this.destroy$)
      )
      .subscribe(data => {
        data.map(e => {
          const employeeEmail = e.payload.doc.data().email;
          this.employees.push(employeeEmail);
        })
      })
  }

  createTask() {
    this.local_data = this.TaskForm.value;
    this.destroy$.next();
    this.destroy$.complete();
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

