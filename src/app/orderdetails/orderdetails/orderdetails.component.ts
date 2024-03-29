import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FecthDataService } from '../../core/services/fecth-data.service';
import { HoldDataService } from '../../core/services/hold-data.service';
import { SetDataService } from '../../core/services/set-data.service';
import {order} from '../../../interfaces/orders'
import { Subject } from 'rxjs';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'app-orderdetails',
  templateUrl: './orderdetails.component.html',
  styleUrls: ['./orderdetails.component.scss']
})
export class OrderdetailsComponent implements OnInit {
  order:order;
  companyId:string;
  currentMessage: string = null; // message to be send
  fileName: string;
  // chatMessages:Array<any> = [
  //   {MediaContentType:"",inbound:true,mediaUrl:"",message:"por favor recuerden que no quiero PICANTE!",messageId:'1',Fecha:"6:39pm"},
  //   {MediaContentType:"",inbound:true,mediaUrl:"",message:"la anterior vez me echaron mucha",messageId:'1',Fecha:"6:39pm"},
  //   {MediaContentType:"",inbound:true,mediaUrl:"",message:"y lo odie demasiado",messageId:'1',Fecha:"6:39pm"},
  //   {MediaContentType:"",inbound:false,mediaUrl:"",message:"Listo señor, solo 5 gr de picante para su pizza",messageId:'1',Fecha:"6:39pm"},
  //   {MediaContentType:"",inbound:false,mediaUrl:"",message:"disculpe el error de la anterior vez",messageId:'1',Fecha:"6:39pm"},
  //   {MediaContentType:"",inbound:false,mediaUrl:"",message:"para compensarle, le agregaremos un postre de brownie!",messageId:'1',Fecha:"6:39pm"},
  //   {MediaContentType:"",inbound:false,mediaUrl:"",message:"le estaremos enviando actualizaciones por WhatsApp",messageId:'1',Fecha:"6:39pm"},
  //   {MediaContentType:"",inbound:true,mediaUrl:"",message:"Listo muchas gracias",messageId:'1',Fecha:"6:39pm"},
  // ]
  chatMessages:Array<any> = [];
  messageSubscription: any;
  destroy$: Subject < void > = new Subject();
  showChat:boolean = false;
  showImage:boolean = false;
  mediaUrl:string;
  constructor(
    private router: Router,
      private _snackBar: MatSnackBar,
      private route: ActivatedRoute,
      private fetchData: FecthDataService,
      private setData: SetDataService,
      private holdData: HoldDataService,
      // private deleteData: DeleteDataService,
  ) {}

  ngOnInit(): void {
    this.companyId = this.holdData.userInfo.companyId; 
    this.order = this.holdData.currentOrder;
    //if the transfer its not confirm, don't show chat
    if(this.order.state !== 'transfer-pending'){
      this.allowGetChatInformation()
      this.showChat = true;
      
    }else {
      //don't show chat, show image
      this.showChat = false;
      this.mediaUrl= this.order.proofTransferPicture;
      this.showImage = true;
    }
  }

  getMessages(){

  }

  goBack() {
    this.router.navigate(['/pedidos']);
  }

  allowGetChatInformation() {
    this.messageSubscription = this.fetchData.getMessagesFromSpecificDeliveryChat(
            this.companyId,
            this.order.id
        )
        .subscribe((dataRta) => {            
            dataRta.map(d => {
              let message =  d.payload.doc.data()             
                this.chatMessages.push(message);                    
              });           
          });
}

prepareOrder(order, time: number){     
  this.setData.startPreparingOrder(this.holdData.userInfo.companyId, this.order.id, time);
  this._snackBar.open('El estado del pedido cambio a "En preparación"', 'Ok', {
    duration: 4000,
});

}
  sendMessage() {
    if (this.currentMessage !== undefined && this.currentMessage !== null && this.currentMessage.trim().length !== 0) {               
        this.setData.sendWhatsappMessageHttp({
                message: this.currentMessage,
                number: this.order.whatsappPhone,
                template: false,
                companyId: this.companyId,
                mediaUrl: null,
                api_url: (this.holdData.companyInfo.api_url) ? this.holdData.companyInfo.api_url : null
            }).toPromise()
            .then(async (data) => {
                const timestamp = this.holdData.convertJSDateIntoFirestoreTimestamp();
                let dataFirebase = {
                        inbound: false,
                        message: this.currentMessage,
                        timestamp: timestamp,
                }  
                await this.setData.sendWhatsappMessageInOrder(this.companyId, this.order.id, dataFirebase);
                
                this.currentMessage = null;
                
            })
            .catch(error => {
                if (error.status === 400) {
                    alert('No se puede enviar mensajes porque la empresa no tiene saldo suficiente');
                } else {                    
                    alert('No pudimos enviar tu mensaje, si el error persiste por favor contáctanos a octo.colombia@gmail.com');
                }
                this.currentMessage = null;
                
            })
    }  else {
        this.currentMessage = null;
    }

  }
          
          ngOnDestroy() {
            this.destroy$.next();
            this.destroy$.complete();
            if (this.messageSubscription) {
                this.messageSubscription.unsubscribe();
            }
        }
        displayImage(url: string) {
          window.open(url, "_blank");
      }
}
