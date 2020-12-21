import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FecthDataService } from '../../core/services/fecth-data.service';
import { HoldDataService } from '../../core/services/hold-data.service';
import { SetDataService } from '../../core/services/set-data.service';

export interface order {
  clientName: string;
  clientPhone: number;
  comments: string;
  deliverMode: string;
  order: Array<any>;
  orderCost:string;
  orderId:string;
  packageCost:string;
  paymentMethod:string;
  state:string;
  timestamp:any;
  unseen:boolean;
}
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

  chatMessages:Array<any> = [
    {MediaContentType:"",inbound:true,mediaUrl:"",message:"por favor recuerden que no quiero PICANTE!",messageId:'1',Fecha:"6:39pm"},
    {MediaContentType:"",inbound:true,mediaUrl:"",message:"la anterior vez me echaron mucha",messageId:'1',Fecha:"6:39pm"},
    {MediaContentType:"",inbound:true,mediaUrl:"",message:"y lo odie demasiado",messageId:'1',Fecha:"6:39pm"},
    {MediaContentType:"",inbound:false,mediaUrl:"",message:"Listo señor, solo 5 gr de picante para su pizza",messageId:'1',Fecha:"6:39pm"},
    {MediaContentType:"",inbound:false,mediaUrl:"",message:"disculpe el error de la anterior vez",messageId:'1',Fecha:"6:39pm"},
    {MediaContentType:"",inbound:false,mediaUrl:"",message:"para compensarle, le agregaremos un postre de brownie!",messageId:'1',Fecha:"6:39pm"},
    {MediaContentType:"",inbound:false,mediaUrl:"",message:"le estaremos enviando actualizaciones por WhatsApp",messageId:'1',Fecha:"6:39pm"},
    {MediaContentType:"",inbound:true,mediaUrl:"",message:"Listo muchas gracias",messageId:'1',Fecha:"6:39pm"},
  ]

  constructor(
    private router: Router,
      // private _snackBar: MatSnackBar,
      private route: ActivatedRoute,
      private fetchData: FecthDataService,
      private setData: SetDataService,
      private holdData: HoldDataService,
      // private deleteData: DeleteDataService,
  ) {}

  ngOnInit(): void {
    this.companyId = this.holdData.userInfo.companyId; 
    this.order = this.holdData.currentOrder;
  }

  getMessages(){

  }

  goBack() {
    this.router.navigate(['/pedidos']);
  }
   
  sendMessage() {
    // // check if chat is active
    // this.fetchData.checkWhatsapp24HourWindow({
    //         companyId: this.companyId,
    //         number: this.currentChatData.phoneNumber,
    //         api_url: (this.holdData.companyInfo.api_url) ? this.holdData.companyInfo.api_url : null
    //     }).toPromise()
    //     .then(async (dataSession) => {
    //         if (dataSession === 'false') {
    //             this.templatesActivated = true;
    //             this.templatesActivatedOptions = true;
    //         }
    //         this.showSpinner = true;
    //         //send message in specific chat
    //         if (this.currentMessage !== undefined && this.currentMessage !== null && this.currentMessage.trim().length !== 0) {
    //             // uncomment in production
    //             let mediaUrl = null;
    //             if (this.fileInfo) {
    //                 mediaUrl = await this.setData.uploadMediaFile(this.companyId, this.currentChatData.phoneNumber, this.fileInfo, this.fileName);
    //             }
    //             this.setData.sendWhatsappMessageHttp({
    //                     message: this.currentMessage,
    //                     number: this.currentChatData.phoneNumber,
    //                     template: this.templatesActivated,
    //                     companyId: this.companyId,
    //                     mediaUrl: mediaUrl,
    //                     api_url: (this.holdData.companyInfo.api_url) ? this.holdData.companyInfo.api_url : null
    //                 }).toPromise()
    //                 .then(async (data) => {
    //                     const timestamp = this.holdData.convertJSDateIntoFirestoreTimestamp();
    //                     let dataFirebase;
    //                     if (mediaUrl) {
    //                         dataFirebase = {
    //                             inbound: false,
    //                             message: this.currentMessage,
    //                             timestamp: timestamp,
    //                             mediaUrl: mediaUrl,
    //                             MediaContentType: this.fileInfo.type
    //                         }
    //                         await this.setData.sendWhatsappMessageFirebase(this.companyId, this.currentChatData.phoneNumber, dataFirebase);
    //                     } else {
    //                         dataFirebase = {
    //                             inbound: false,
    //                             message: this.currentMessage,
    //                             timestamp: timestamp,
    //                         }
    //                         await this.setData.sendWhatsappMessageFirebase(this.companyId, this.currentChatData.phoneNumber, dataFirebase);
    //                     }
    //                     this.currentMessage = null;
    //                     this.fileInfo = null;
    //                     this.fileName = '';
    //                     this.showSpinner = false;
    //                 })
    //                 .catch(error => {
    //                     if (error.status === 400) {
    //                         alert('No se puede enviar mensajes porque la empresa no tiene saldo suficiente');
    //                     } else {
    //                         console.log(error);
                            
    //                         alert('No pudimos enviar tu mensaje, si el error persiste por favor contáctanos a octo.colombia@gmail.com');
    //                     }
    //                     this.currentMessage = null;
    //                     this.fileInfo = null;
    //                     this.fileName = '';
    //                     this.showSpinner = false;
    //                 })
    //         } else if(this.voiceNote) {
    //           let mediaUrl;
    //           const randomName = this.holdData.createRandomId();
    //           mediaUrl = await this.setData.uploadMediaFile(this.companyId, this.currentChatData.phoneNumber, this.voiceNote, randomName);
    //           this.setData.sendWhatsappMessageHttp({
    //                   message: this.currentMessage,
    //                   number: this.currentChatData.phoneNumber,
    //                   template: this.templatesActivated,
    //                   companyId: this.companyId,
    //                   mediaUrl: mediaUrl,
    //                   api_url: (this.holdData.companyInfo.api_url) ? this.holdData.companyInfo.api_url : null
    //               }).toPromise()
    //               .then(async (data) => {
    //                   const timestamp = this.holdData.convertJSDateIntoFirestoreTimestamp();
    //                   let dataFirebase;
    //                   if (mediaUrl) {
    //                       dataFirebase = {
    //                           inbound: false,
    //                           message: this.currentMessage,
    //                           timestamp: timestamp,
    //                           mediaUrl: mediaUrl,
    //                           MediaContentType: 'file'
    //                       }
    //                       await this.setData.sendWhatsappMessageFirebase(this.companyId, this.currentChatData.phoneNumber, dataFirebase);
    //                   }                        
    //                   this.voiceNote = null;
    //                   this.showSpinner = false;
    //               })
    //               .catch(error => {
    //                   if (error.status === 400) {
    //                       alert('No se puede enviar mensajes porque la empresa no tiene saldo suficiente');
    //                   } else {
    //                       console.log(error);
    //                       alert('No pudimos enviar tu mensaje, si el error persiste por favor contáctanos a octo.colombia@gmail.com');
    //                   }
    //                   this.voiceNote = null;
    //                   this.showSpinner = false;
    //               })
    //         } else {
    //             this.currentMessage = null;
    //         }
    //     })
}
}
