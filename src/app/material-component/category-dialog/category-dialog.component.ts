import { Component, Inject } from '@angular/core';
import {  MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
// services
import { FecthDataService } from '../../core/services/fecth-data.service';
import { HoldDataService } from '../../core/services/hold-data.service';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';


@Component({
  selector: 'app-category-dialog',
  templateUrl: './category-dialog.component.html',
  styleUrls: ['./category-dialog.component.scss']
})
export class CategoryComponent {
  action:string;
  local_data: any;
  isReadOnly:boolean;
  fileInfo:string;
  employees: Array<any> = [];
  destroy$: Subject<void> = new Subject();
  constructor(
    public dialogRef: MatDialogRef<CategoryComponent>,
    private fetchData: FecthDataService,
    private holdData: HoldDataService,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {
    
  }

  onNoClick(): void {
    this.destroy$.next();
    this.destroy$.complete();
    this.dialogRef.close({event: 'close'});
  }

  createCategory() {
    this.dialogRef.close( this.local_data);
  }


 
}

