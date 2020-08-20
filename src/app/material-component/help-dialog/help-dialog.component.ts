import { Component, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';

@Component({
  selector: 'app-help-dialog',
  templateUrl: './help-dialog.component.html',
  styleUrls: ['./help-dialog.component.scss']
})
export class HelpDialogComponent {

  value: string;
  constructor(
    public dialogRef: MatDialogRef<HelpDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {}

  onNoClick(): void {
    this.dialogRef.close({event: 'close'});
  }

  sendSuggestion() {
    this.dialogRef.close({event: 'suggestion', data: this.value});
  }
}
