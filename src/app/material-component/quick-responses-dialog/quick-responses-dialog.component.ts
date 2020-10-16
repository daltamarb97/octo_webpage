import { Component, OnInit, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { FecthDataService } from '../../core/services/fecth-data.service';
import { HoldDataService } from '../../core/services/hold-data.service';
import { SetDataService } from '../../core/services/set-data.service';
import { takeUntil } from 'rxjs/operators';
import { Subject } from 'rxjs';

@Component({
  selector: 'app-quick-responses-dialog',
  templateUrl: './quick-responses-dialog.component.html',
  styleUrls: ['./quick-responses-dialog.component.scss']
})
export class QuickResponsesDialogComponent implements OnInit {

  quickResponses = [];
  showInput: boolean = false;
  newQR: string = null;
  showQRError:boolean = false;
  destroy$: Subject<void> = new Subject();
  constructor(
    public dialogRef: MatDialogRef<QuickResponsesDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private fetchData: FecthDataService,
    private setData: SetDataService,
    private holdData: HoldDataService
  ) { }

  ngOnInit(): void {
    this.fetchData.getQuickResponses(this.holdData.companyInfo.companyId)
    .pipe(
      takeUntil(this.destroy$)
    )
    .subscribe(data => {
      this.quickResponses = data;
    })
  }

  onNoClick(){
    this.destroy$.next();
    this.destroy$.complete();
    this.dialogRef.close({event: 'cancel'});
  }

  chooseResponse(qr) {
    this.destroy$.next();
    this.destroy$.complete();
    this.dialogRef.close({event: 'option', data: qr.message});
  }

  createResponse() {
    if(!this.newQR) {
      this.showQRError = true;
    } else {
      this.setData.createQuickResponse(this.holdData.companyInfo.companyId, this.newQR);
      this.showInput = false;
      this.showQRError = false;
      this.newQR = null;
    }
  }

}
