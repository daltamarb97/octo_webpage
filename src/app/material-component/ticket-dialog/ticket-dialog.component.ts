import { Component, Inject, Optional } from '@angular/core';
import {  MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
// services
import { FecthDataService } from '../../core/services/fecth-data.service';
import { HoldDataService } from '../../core/services/hold-data.service';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';


@Component({
  selector: 'app-ticket-dialog',
  templateUrl: './ticket-dialog.component.html',
  styleUrls: ['./ticket-dialog.component.scss']
})
export class TicketDialogComponent {
  action: string;
  local_data: any;
  employees:any = [];
  employeesAssignated:any = [];
  removable = true;

  constructor(
    public dialogRef: MatDialogRef<TicketDialogComponent>,
    private formBuilder: FormBuilder,
    private fetchData: FecthDataService,
    private holdData: HoldDataService,
    @Optional() @Inject(MAT_DIALOG_DATA) public data: any) {
      
        this.local_data = { ...data };        
        this.local_data.creator = this.holdData.userInfo.name + this.holdData.userInfo.lastname
        this.local_data.creatorId = this.holdData.userId; 
        //get all the company employees
        this.fetchData.getCompanyEmployees(this.holdData.userInfo.companyId)
      .subscribe(data => {
        data.map(e => {
          const data = e.payload.doc.data(); 
          this.employees.push(data);
        })
      })
  }
  
  addPerson(person){
    this.employeesAssignated.push(person);
  }

  remove(person) {
    const index = this.employeesAssignated.indexOf(person);

    if (index >= 0) {
      this.employeesAssignated.splice(index, 1);
    }
  }

  create(){
    this.local_data.assignTo = this.employeesAssignated;
    this.dialogRef.close({ event: 'Success', data: this.local_data });
  }

  closeDialog() {
      this.dialogRef.close({ event: 'Cancel' });
  }

}

