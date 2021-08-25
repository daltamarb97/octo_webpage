import { Inject, Component } from "@angular/core";
import { MAT_DIALOG_DATA, MatDialogRef } from "@angular/material/dialog";


@Component({
  selector: 'app-drop-files',
  templateUrl: './drop-files.component.html',
  styleUrls: ['./drop-files.component.scss']
})
export class DropFilesComponent {

  public localData: any;
  public loadingDoc: boolean = false;

  constructor(
    public dialogRef: MatDialogRef<DropFilesComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {
    this.localData = data;
  }

  closeModal() {
    this.dialogRef.close({event: 'cancel'});
  }

  newFileDropped(files) {
    this.dialogRef.close({event: 'picture', files: files});
  }

  copyUrl() {
    this.dialogRef.close({event: 'cancel'});
  }

}

