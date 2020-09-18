import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { DeleteDataService } from '../../core/services/delete-data.service';
import { FecthDataService } from '../../core/services/fecth-data.service';
import { HoldDataService } from '../../core/services/hold-data.service';
import { SetDataService } from '../../core/services/set-data.service';
import { MessageComponent } from '../../material-component/message-dialog/message-dialog.component';
import { OptionComponent } from '../../material-component/option-dialog/option-dialog.component';

@Component({
  selector: 'app-chat-flow',
  templateUrl: './chat-flow.component.html',
  styleUrls: ['./chat-flow.component.css']
})
export class ChatFlowComponent implements OnInit {
  currentFlowList: Array<any> = [];
  companyId:any;
  currentIndex: number;
  flow: Array<any> = [];
  mainMessageFlow:any;
  showSpinner: boolean= false;
  mainMessageSubs: any;
  constructor(
    private setData: SetDataService,
    private fetchData: FecthDataService,
    private holdData: HoldDataService,
    private deleteData: DeleteDataService,
    public dialog: MatDialog,
  ) { }

  async ngOnInit(){
    this.companyId = this.holdData.userInfo.companyId;
    this.getCompleteFlow();
  }

  getCompleteFlow(){
    // flow subscription
    this.mainMessageSubs = this.fetchData.getCompleteFlow(this.companyId)
      .subscribe(async (data) => {
        // get whole flow at once
        data.map(d => {
          this.flow.push(d.payload.doc.data());
        })
        // get main message and its options
        this.mainMessageFlow = this.flow.filter(d => d.main === true);
        const optionsData = await this.fetchData.getFlowOptions(this.companyId, this.mainMessageFlow[0].flowId).toPromise()
        let optionListMessage = []; 
        optionsData.forEach(o => {
          optionListMessage.push(o.data());
        });
        this.mainMessageFlow[0].options = optionListMessage;
        if (this.currentFlowList.length === 0) this.currentFlowList = this.mainMessageFlow;
        this.currentIndex = 1;
      })
  }


  createOption(flow, index){
    // if(this.mainMessageSubs) this.mainMessageSubs.unsubscribe();
    const dialogRef = this.dialog.open(OptionComponent, {data: this.companyId});
    dialogRef.afterClosed()
      .subscribe(async result =>{ 
        this.showSpinner = true;
        if (result.event !== 'close') {
          let dataRta = {
            ...result.data,
            options: result.options,
            agent: result.agent
          }
          if (dataRta.file) {
            dataRta.mediaUrl = await this.setData.uploadFileForOption(this.companyId, dataRta.file.name, dataRta.file);
            const redirectTo =  await this.setData.setOptionInFlow(this.companyId, flow.flowId, dataRta);
            dataRta.redirectTo =  redirectTo;
            this.currentFlowList[index].options.push(dataRta);
            this.showSpinner = false;
          } else {
            dataRta.mediaUrl = '';
            const redirectTo = await this.setData.setOptionInFlow(this.companyId, flow.flowId, dataRta)
            dataRta.redirectTo =  redirectTo;
            this.currentFlowList[index].options.push(dataRta);
            this.showSpinner = false;
          }
        }else  {
          this.showSpinner = false;
        }
      })
  }


  async seeOption(option, index){
    // if(this.mainMessageSubs) this.mainMessageSubs.unsubscribe();
    // get options of current flow message if options
    if ((index + 1) <= this.currentIndex) {
      this.currentFlowList.splice((index + 1), (this.currentIndex - index));
      this.currentIndex = index + 1;
    } else {
      this.currentIndex ++;
    }
    let optionListMessage = [];
    const optionRta: any = this.flow.filter(d => d.flowId === option.redirectTo); 
    console.log(this.flow);
    
    optionRta[0].shortMessage = option.message;
    if (optionRta[0].options === true){
      const optionsData = await this.fetchData.getFlowOptions(this.companyId, optionRta[0].flowId).toPromise();
      optionsData.forEach(o => {
        optionListMessage.push(o.data());
      });
      optionRta[0].options = optionListMessage
    }
    (this.currentFlowList.length === 0) ? this.currentFlowList = optionRta : this.currentFlowList.push(optionRta[0]);
  }


  editMessage(){
    const dialogRef = this.dialog.open(MessageComponent, {data: this.companyId});
  dialogRef.afterClosed()
  .subscribe(result =>{
    // Aquí escribes la función de guardar la opción     
    // this.setData.createCategory(
    //   this.companyId, 
    //   result
    // );  
  })
  }
}
