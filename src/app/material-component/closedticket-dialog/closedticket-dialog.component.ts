import { Component, Inject, Optional } from '@angular/core';
import {  MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { FormBuilder } from '@angular/forms';
// services
import { FecthDataService } from '../../core/services/fecth-data.service';
import { HoldDataService } from '../../core/services/hold-data.service';

@Component({
  selector: 'app-closedticket-dialog',
  templateUrl: './closedticket-dialog.component.html',
  styleUrls: ['./closedticket-dialog.component.scss']
})
export class ClosedTicketDialogComponent {
  action: string;
  local_data: any;
 
  constructor(
    public dialogRef: MatDialogRef<ClosedTicketDialogComponent>,
    private formBuilder: FormBuilder,
    private fetchData: FecthDataService,
    private holdData: HoldDataService,
    @Optional() @Inject(MAT_DIALOG_DATA) public data: any) {
        this.local_data = { ...data };        
        console.log(this.local_data);
        
        
  }
  
  

  closeDialog() {
      this.dialogRef.close({ event: 'Cancel' });
  }

}

