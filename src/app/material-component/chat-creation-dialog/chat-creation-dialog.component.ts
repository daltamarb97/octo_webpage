import { Component, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';

import { FecthDataService } from '../../core/services/fecth-data.service';


@Component({
  selector: 'app-chat-creation-dialog',
  templateUrl: './chat-creation-dialog.component.html',
  styleUrls: ['./chat-creation-dialog.component.scss']
})
export class ChatCreationDialogComponent {

  residentsList: Array<any> = [];
  local_data:any = {
    name: '',
    description: '',
    participants: []
  }
  action:string;

  constructor(
    public dialogRef: MatDialogRef<ChatCreationDialogComponent>,
    // services
    private fetchData: FecthDataService,
    @Inject(MAT_DIALOG_DATA) public data: any) {
      this.action = data;
      if(this.action !== 'delete'){
        this.getBuidlingResidentsAndEmployees(this.action);
      }
    }

    
  onNoClick(): void {
    this.dialogRef.close();
  }


  createChatRoom(){
    this.dialogRef.close({data: this.local_data});
  }


  deleteChatRoom(){
    this.dialogRef.close({data: this.action});
  }


  private  getBuidlingResidentsAndEmployees(buildingId){
    // list of residents and employees
    this.fetchData.getBuidlingResidents(buildingId)
    .subscribe((resData)=>{
      resData.map(r => {
        const res = r.payload.doc.data();
        this.residentsList.push(res);
      })
    });

    this.fetchData.getBuidlingEmployees(buildingId)
    .subscribe((empData)=>{
      empData.map(e => {
        const emp = e.payload.doc.data();
        this.residentsList.push(emp);
      })
    });
  }

}
