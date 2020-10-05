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
  input: any;
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
  }

  onNoClick(): void {
    this.destroy$.next();
    this.destroy$.complete();
    this.dialogRef.close({event: 'close'});
  }

  addOption() {
    this.dialogRef.close({event: this.input.event, data: this.local_data, agent: this.agent, options: this.options, mainMenu: this.mainMenu});
  }

  selectImage(file) {
    this.local_data.file = file.target.files[0];
  }
}

