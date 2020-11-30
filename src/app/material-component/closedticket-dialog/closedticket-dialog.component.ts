import { Component, Inject, Optional } from '@angular/core';
import {  MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { FormBuilder } from '@angular/forms';
// services
import { FecthDataService } from '../../core/services/fecth-data.service';
import { HoldDataService } from '../../core/services/hold-data.service';
import { takeUntil } from 'rxjs/operators';
import { Subject } from 'rxjs';

@Component({
  selector: 'app-closedticket-dialog',
  templateUrl: './closedticket-dialog.component.html',
  styleUrls: ['./closedticket-dialog.component.scss']
})
export class ClosedTicketDialogComponent {
  action: string;
  local_data: any;
  destroy$: Subject < void > = new Subject();
  commentsChat: Array<any> = [];
  constructor(
    public dialogRef: MatDialogRef<ClosedTicketDialogComponent>,
    private fetchData: FecthDataService,
    @Optional() @Inject(MAT_DIALOG_DATA) public data: any) {
        this.local_data = { ...data }; 
        this.getComments();       
  }
  
  getComments() {
    this.fetchData.getCommentsChat({
      companyId: this.local_data.companyId,
      ticketId: this.local_data.id
    }).pipe(
        takeUntil(this.destroy$)
    ).subscribe(data => {
        this.commentsChat = data;
    })
  }

  closeDialog() {
      this.dialogRef.close({ event: 'cancel' });
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

}

