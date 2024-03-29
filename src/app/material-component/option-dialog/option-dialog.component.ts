import { Component, Inject } from '@angular/core';
import {  MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
// services
import { FecthDataService } from '../../core/services/fecth-data.service';
import { HoldDataService } from '../../core/services/hold-data.service';
import { Subject } from 'rxjs';


@Component({
  selector: 'app-option-dialog',
  templateUrl: './option-dialog.component.html',
  styleUrls: ['./option-dialog.component.scss']
})
export class OptionComponent {
  local_data: any;
  destroy$: Subject<void> = new Subject();
  agent: boolean = false;
  options: boolean = false;
  mainMenu: boolean = false;
  form: boolean = false;
  input: any;
  assignedTo: any = null;
  formToSend: string = null;
  showError: boolean = false;
  availableAgents: Array<any> = [];
  formsAvailable: Array<any> = [];
  responseId: string = null;
  constructor(
    public dialogRef: MatDialogRef<OptionComponent>,
    private fetchData: FecthDataService,
    private holdData: HoldDataService,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {
    this.input = data;
    this.local_data = {
      name: '',
      message: '',
      file: null
    }
    this.responseId = this.holdData.createRandomId();
    this.fetchData.getCompanyEmployees(this.holdData.companyInfo.companyId)
      .subscribe(data => {
        data.map(d => {this.availableAgents.push(d.payload.doc.data())});
      })
    
    this.fetchData.getFormsFromCompany(this.holdData.companyInfo.companyId)
      .subscribe(data => {
        data.forEach(f => {this.formsAvailable.push(f.data())})
      })
  }

  onNoClick(): void {
    this.destroy$.next();
    this.destroy$.complete();
    this.dialogRef.close({event: 'close'});
  }

  addOption() {
    this.showError = false;
    if (this.agent) {
      if (this.assignedTo) {
        this.dialogRef.close(
          {
            event: this.input.event, 
            data: this.local_data, 
            agent: this.agent, 
            assignedTo: this.assignedTo, 
            options: this.options, 
            mainMenu: this.mainMenu,
            formId: (this.form) ? this.formToSend : null,
            responseId: (this.form) ? this.responseId : null
          }
        );
      } else {
        this.showError = true;
      }
    } else {
      this.dialogRef.close(
        {
          event: this.input.event, 
          data: this.local_data, 
          agent: this.agent, 
          assignedTo: this.assignedTo, 
          options: this.options, 
          mainMenu: this.mainMenu,
          formId: (this.form) ? this.formToSend : null,
          responseId: (this.form) ? this.responseId : null
        }
      );
    }
  }

  selectImage(file) {
    this.local_data.file = file.target.files[0];
  }

  agentToggle(){
    this.mainMenu = false;
    this.options = false;
    this.showError = false;
    this.form = false;
  }

  optToggle(){
    this.agent = false;
    this.assignedTo = null;
    this.showError = false;
    this.form = false;
  }

  formToggle() {
    this.mainMenu = false;
    this.options = false;
    this.showError = false;
    this.agent = false;
    this.assignedTo = null;
  }
}

