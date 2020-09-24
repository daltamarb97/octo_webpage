import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { DeleteDataService } from '../../core/services/delete-data.service';
import { FecthDataService } from '../../core/services/fecth-data.service';
import { HoldDataService } from '../../core/services/hold-data.service';
import { SetDataService } from '../../core/services/set-data.service';
import { OptionComponent } from '../../material-component/option-dialog/option-dialog.component';
import { EditOptDialogComponent } from '../../material-component/editopt-dialog/editopt-dialog.component';
import { Router } from '@angular/router';

@Component({
  selector: 'app-chat-flow',
  templateUrl: './chat-flow.component.html',
  styleUrls: ['./chat-flow.component.scss']
})
export class ChatFlowComponent implements OnInit {
  companyId:any;
  flow: any = null;
  prevFlow: any = null;
  mainMessageFlow:any;
  showSpinner: boolean= false;
  messageSubs: any;
  optionSubs: any;
  showBot: boolean = true;
  flowOptions:Array<any> = [];
  previousFlow:any = null;
  counter: number = -1;
  listFlow: Array<any> = [];
  constructor(
    private setData: SetDataService,
    private fetchData: FecthDataService,
    private holdData: HoldDataService,
    private deleteData: DeleteDataService,
    public dialog: MatDialog,
    private router: Router,
  ) { }

  async ngOnInit(){
    if (!this.holdData.companyInfo) {
      this.router.navigate(['no-comp'])
    }
    this.companyId = this.holdData.userInfo.companyId;
    if(this.companyId) {
      this.showBot = this.holdData.companyInfo.bot || false;
    } else {
      this.showBot = false;
    }    
    this.getMainFlow();
  }

  ngOnDestroy(){
    if (this.messageSubs) this.messageSubs.unsubscribe();
    if(this.optionSubs) this.optionSubs.unsubscribe();
  }

  getMainFlow(){
    // flow subscription
    this.fetchData.getCompleteFlow(this.companyId)
      .toPromise()
      .then(data => {
        data.forEach(d => {
          if(d.data().main === true) {
            this.seeOption({redirectTo: d.data().flowId});
          }
        })
      })
  }

  createOption(){
    const dialogRef = this.dialog.open(OptionComponent, {data: {companyId: this.companyId, event: 'old'}});
    dialogRef.afterClosed()
      .subscribe(async result =>{ 
        this.showSpinner = true;
        if (result.event === 'old') {   
          let dataRta = {
            ...result.data,
            options: result.options,
            agent: result.agent,
          }
          if (dataRta.file) {
            dataRta.mediaUrl = await this.setData.uploadFileForOption(this.companyId, dataRta.file.name, dataRta.file);
            await this.setData.setOptionInFlow(this.companyId, this.prevFlow.flowId, dataRta);
            this.showSpinner = false;
          } else {
            dataRta.mediaUrl = '';
            await this.setData.setOptionInFlow(this.companyId, this.prevFlow.flowId, dataRta)
            this.showSpinner = false;
          }
        }else  {
          this.showSpinner = false;
        }
      })
  }

  async seeOption(option){
    // get options of current flow message if options
    if (this.messageSubs) this.messageSubs.unsubscribe();    
    this.counter ++;
    if(this.prevFlow) this.previousFlow = this.prevFlow;
    let redirection;
    (!option.redirectTo) ? redirection = option.flowId : redirection = option.redirectTo;
    this.messageSubs = this.fetchData.getSpecificFlow(this.companyId, redirection)
      .subscribe(data => {
        this.prevFlow = data;
        if(option.message) {
          if(option.shortMessage) {
            this.prevFlow.shortMessage = option.shortMessage
          } else {
            this.prevFlow.shortMessage = option.message;
          }
        }
        this.listFlow.push(this.prevFlow);
        this.flow = this.listFlow[this.counter];         
        this.getOptions();
      })
  }

  editMessage(){
    const dialogRef = this.dialog.open(EditOptDialogComponent, {data: this.prevFlow.message});
    dialogRef.afterClosed()
      .subscribe(async (result) => {
        if(result.event !== 'close'){
          const data = {
            companyId: this.companyId,
            flowId: this.prevFlow.flowId,
            message: result.message
          }
          await this.setData.updateMessageFlow(data);
          this.listFlow[this.counter].message = result.message;
          this.listFlow.pop();
        }
      })
  }

  async deleteFlow(){
    const data = {
      companyId: this.companyId,
      flowId: this.prevFlow.flowId,
      parentFlow: (this.prevFlow.main) ? null : this.previousFlow.flowId
    } 
    if (this.messageSubs) this.messageSubs.unsubscribe();
    this.deleteData.deleteFlow(data)
      .then(()=> { 
        if (this.prevFlow.main) { 
          this.messageSubs.unsubscribe();
          this.optionSubs.unsubscribe();
          this.flow = null;
          this.listFlow = []; 
        } else { 
          this.goPreviousFlow();
        }
      })
  }

  createFirstFlow() {
    const dialogRef = this.dialog.open(OptionComponent, {data: {companyId: this.companyId, event: 'first'}});
    dialogRef.afterClosed()
      .subscribe(async result =>{ 
        if(result.event === 'first') {
          this.setData.createFirstFlow(this.companyId, result.data.message)
            .then(flowId => {
              this.seeOption({redirectTo: flowId});
            })
        }
      })
  }

  getOptions() {
    if(this.optionSubs) this.optionSubs.unsubscribe();
    this.flowOptions = [];
    this.optionSubs = this.fetchData.getFlowOptions(this.companyId, this.prevFlow.flowId)
      .subscribe(data => {
        this.flowOptions = data;  
      })
  }

  goPreviousFlow(){
    this.listFlow.splice(this.counter, 1);
    this.counter -= 1;
    this.prevFlow = this.listFlow[this.counter];
    this.previousFlow = this.listFlow[this.counter -1];
    if (this.messageSubs) this.messageSubs.unsubscribe();    
    this.messageSubs = this.fetchData.getSpecificFlow(this.companyId, this.prevFlow.flowId)
    .subscribe(data => {
      this.flow = this.listFlow[this.counter];    
      this.getOptions();
    })
  }
}
