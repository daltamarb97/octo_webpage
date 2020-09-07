import { Component, Inject } from '@angular/core';
import {  MatDialogRef, 
          MAT_DIALOG_DATA, 
} from '@angular/material/dialog';
import { FecthDataService } from '../../core/services/fecth-data.service';
import { HoldDataService } from '../../core/services/hold-data.service';
import { HttpClient, HttpHeaders } from '@angular/common/http';

@Component({
  selector: 'app-profile-dialog',
  templateUrl: './profile-dialog.component.html',
  styleUrls: ['./profile-dialog.component.scss']
})
export class ProfileDialogComponent{

  action: string;
  local_data:any;
  plans: Array<any> = [];
  showPlans:boolean = false;
  amountToCharge: number = 0.00;
  chosenPlan:any;
  notMinAmt: boolean = false;
  showEmailConf: boolean = false;
  showSpinner:boolean = false;
  currentCompanyBalance: any;

  constructor(
    public dialogRef: MatDialogRef<ProfileDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private fecthData: FecthDataService,
    private holdData: HoldDataService,
    private http: HttpClient
  ) { 
    // local_data receives data from the component in which this dialog was called
    this.local_data = {... data};
    this.action = this.local_data.action;
    // get payment plans
    this.fecthData.getPaymentPlans()
      .subscribe(data => {
        data.forEach(d => {
          this.plans.push(d.data());
        })

        this.showPlans = true;
      })
    // get current company balance
    this.fecthData.getBalanceCompanyInfo(this.holdData.userInfo.companyId)
      .subscribe(data => {
        this.currentCompanyBalance = data.data();
      })
  }


  onNoClick(){
    this.action = 'cancel'
    this.dialogRef.close({event: this.action});
  }

  copyMessage(){
    // logic for copying payment link
    const selBox = document.createElement('textarea');
    selBox.style.position = 'fixed';
    selBox.style.left = '0';
    selBox.style.top = '0';
    selBox.style.opacity = '0';
    selBox.value = this.local_data.paymentLink;
    document.body.appendChild(selBox);
    selBox.focus();
    selBox.select();
    document.execCommand('copy');
    document.body.removeChild(selBox);
  }

  choosePlan(plan){    
    this.showPlans = false;
    this.chosenPlan = plan;
  }

  sendPaymentLink(){
    this.notMinAmt = false;
    if(this.amountToCharge < this.chosenPlan.minBalance) {
      this.notMinAmt = true;
    } else {
      const data = {
        plan: this.chosenPlan.name,
        amount: this.amountToCharge,
        email: this.holdData.userInfo.email,
        name: `${this.holdData.userInfo.name} ${this.holdData.userInfo.lastname}`
      }
      this.sendEmailPayment(data)
        .toPromise()
        .then(result => {
          this.showEmailConf = true;
          this.showSpinner = false;
        })
        .catch(err => {
          this.showSpinner = false;
        })
    }
  }

  private sendEmailPayment(data){
    this.showSpinner = true;
    const api_url = "https://us-central1-admos-enterprise.cloudfunctions.net/paymentLink"
    let headers = new HttpHeaders({ 'Content-Type': 'application/JSON' });
    const req = this.http.post(api_url, JSON.stringify(data), {headers: headers, responseType: 'json'});
    return req;
  }
}

