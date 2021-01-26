import {
  Component,
  OnInit,
  ViewChild,
  NgZone
} from '@angular/core';
import {
  MatDialog
} from '@angular/material/dialog';
import {
  FecthDataService
} from '../../core/services/fecth-data.service';
import {
  SetDataService
} from '../../core/services/set-data.service';
import {
  DeleteDataService
} from '../../core/services/delete-data.service';
import {
  takeUntil,
  take
} from 'rxjs/operators';
import {
  Subject
} from 'rxjs';
import {
  HoldDataService
} from '../../core/services/hold-data.service';
import {
  CdkTextareaAutosize
} from '@angular/cdk/text-field';
import {
  Router, ActivatedRoute
} from '@angular/router';
import {
  QuickResponsesDialogComponent
} from '../../material-component/quick-responses-dialog/quick-responses-dialog.component';
import {
  TicketDialogComponent
} from '../../material-component/ticket-dialog/ticket-dialog.component';
import {
  MatSnackBar
} from '@angular/material/snack-bar';
import { DateAdapter, MAT_DATE_FORMATS, NativeDateAdapter } from '@angular/material/core';
import { formatDate } from '@angular/common';

export class currentChatData {
  phoneNumber: string;
  finished: boolean = false;
  ticketId: string;
  assignTo: any = [];
  hasTicket: boolean = false;
  private: boolean = false;
  chatName?:string; 
  timestamp: any;
}
declare var MediaRecorder: any;
export const PICK_FORMATS = {
    parse: {dateInput: {month: 'short', year: 'numeric', day: 'numeric'}},
    display: {
        dateInput: 'input',
        monthYearLabel: {year: 'numeric', month: 'short'},
        dateA11yLabel: {year: 'numeric', month: 'long', day: 'numeric'},
        monthYearA11yLabel: {year: 'numeric', month: 'long'}
    }
  };
  
  class PickDateAdapter extends NativeDateAdapter {
    format(date: Date, displayFormat: Object): string {
        if (displayFormat === 'input') {
            return formatDate(date,'dd-MMM-yyyy',this.locale);;
        } else {
            return date.toDateString();
        }
    }
  }

@Component({
  selector: 'app-closedchats',
  templateUrl: './closedchats.component.html',
  styleUrls: ['./closedchats.component.scss'],
  providers: [
    {provide: DateAdapter, useClass: PickDateAdapter},
    {provide: MAT_DATE_FORMATS, useValue: PICK_FORMATS}
  ]
})
export class ClosedchatsComponent implements OnInit {
  @ViewChild('autosize') autosize: CdkTextareaAutosize;

  destroy$: Subject < void > = new Subject();
  destroyMsgSubs$: Subject < void > = new Subject();

  userId: string;
  companyId: string;
  chatWhatsapp: Array < any > = []; // list of names of rooms
  chatWhatsappAssigned: Array < any > = []; // list of names of rooms
  chatMessages: Array < any > = []; // array of messages of specific room
  currentMessage: string = null; // message to be send
  currentChatData: currentChatData; // information of selected room chat
  showTicket: boolean = false;
  WMessages: number;
  WSenders: number;
  chat: any;
  employeesList: Array < any > = [];
  templatesArray: Array < any > = [];
  templatesActivated: boolean = false;
  templatesActivatedOptions: boolean = false;
  fileName: string;
  fileInfo: any;
  chatNote: string;
  showSpinner: boolean = false;
  firstTimeMsgLoad: boolean = false;
  commentsChat: Array < any > = [];
  isAdmin: boolean = false;
  showChip: boolean = false;
  tagsCategories: any = [];
  tagsCategoriesNames: any = [];
  tagsFromConversation: any = [];
  firstTimePrivateMsgLoad: boolean = false;
  commentsSubscription: any;
  messageSubscription: any;
  formsAlias: Array < any > = [];
  sendFormOnTicketClose: boolean = false;
  formOnTicket: any;
  mediaRecorder: any;
  showMic: boolean = true;
  timeRecorded: number = 0;
  saveAudio: boolean = false;
  voiceNote: any;
  showGeneralChat: boolean = false;
  visible = true;
  selectable = true;
  removable = true;
  employees: any = [];
  employeesAssignated: Array < any > = [];
  ticket: any;
  status: string;
  showDetail: boolean = false;
  privateChat: boolean = false;
  showPrivateChat: boolean = false;
  iAmAssigned: boolean = false;
  name:string;
  showDate:boolean;
  hideDate:boolean;
  date:number;
  datePick: any;
  chatInfoSubscription: any;
  constructor(
      private fetchData: FecthDataService,
      private setData: SetDataService,
      private holdData: HoldDataService,
      private deleteData: DeleteDataService,
      // Angular components
      public dialog: MatDialog,
      private _ngZone: NgZone,
      private router: Router,
      private _snackBar: MatSnackBar,
      private route: ActivatedRoute,
  ) {
      //getting info of chat if comes
    this.route.queryParams.subscribe(async() => {
        if (this.router.getCurrentNavigation().extras.state) {
            const currentNav = this.router.getCurrentNavigation().extras.state
            if (currentNav.data) {
                this.getMessagesFromChatOnclick(currentNav.data, false);
            } 
        }
    });
  }

  ngOnDestroy() {
      this.destroy$.next();
      this.destroy$.complete();
      if (this.messageSubscription && this.commentsSubscription) {
          this.messageSubscription.unsubscribe();
          this.commentsSubscription.unsubscribe();
      }
  }

  ngOnInit(): void {
      if (!this.holdData.companyInfo) {
          this.router.navigate(['no-comp'])
      }
      this.userId = this.holdData.userId;
      this.companyId = this.holdData.userInfo.companyId;
      if (this.holdData.companyInfo.admin !== this.userId) {
          this.isAdmin = false;
      } else {
          this.isAdmin = true;
      }
      this.getChatWhatsappNames();
      this.getCompanyEmployees();
      this.getWhatsappTemplateMessages();
      this.getForms();
  }

  createChat() {
      this.router.navigate(['directorio']);
  }

  getForms() {
      // get forms from company
      this.fetchData.getFormsFromCompany(this.companyId)
          .subscribe(data => {
              data.forEach(d => {
                  this.formsAlias.push(d.data());
              })
          })
  }

  getCompanyEmployees() {
      // get employees info on init
      this.fetchData.getCompanyEmployees(this.companyId)
          .subscribe(data => {
              data.map(d => {
                  const rta = d.payload.doc.data();
                  const data = {
                      email: rta.email,
                      userId: rta.userId,
                      name: `${rta.name}`,
                      lastname: `${rta.lastname}`
                  }
                  this.employeesList.push(data);
              })
          })
  }

  getWhatsappTemplateMessages() {
      // get whatsapp approve templates  
      if (this.holdData.companyInfo.api_url) {
          this.fetchData.getWhatsappTemplates(this.companyId, true)
              .subscribe(data => {
                  let obj = data.data();
                  Object.keys(obj).forEach(k => {
                      this.templatesArray.push(obj[k]);
                  })
              })
      } else {
          this.fetchData.getWhatsappTemplates(this.companyId, false)
              .subscribe(data => {
                  let obj = data.data();
                  Object.keys(obj).forEach(k => {
                      this.templatesArray.push(obj[k]);
                  })
              })
      }
  }

  /*******************
  ROOM CHAT
  *******************/
  getChatWhatsappNames() {
      // get chat rooms names
      const timestamp = this.holdData.convertJSCustomDateIntoFirestoreTimestamp(new Date("December 31, 1970 00:00:00"));
      this.chatInfoSubscription = this.fetchData.getWhatsappClosedChats(this.companyId, timestamp)
        .pipe(
            takeUntil(this.destroy$)
        )
        .subscribe(data => { 
            this.chatWhatsapp = [];
            this.chatWhatsappAssigned = [];
            data.forEach(d => {
                if(!d.agent && d.finished) this.chatWhatsapp.push(d);
                if (d.agent) {
                    this.chatWhatsapp.push(d);
                    for (let j = 0; j < d.assignTo.length; j++) {
                        if (d.assignTo[j].userId === this.userId && !d.finished) {
                            this.chatWhatsappAssigned.push(d);
                        }
                    }
                }
            })
        });
  }

  dateFilter(){
    if (this.chatInfoSubscription) this.chatInfoSubscription.unsubscribe();
    const timestamp = this.holdData.convertJSCustomDateIntoFirestoreTimestamp(this.datePick);
      this.chatInfoSubscription = this.fetchData.getWhatsappClosedChats(this.companyId, timestamp)
        .pipe(
            takeUntil(this.destroy$)
        )
        .subscribe(data => {
            this.chatWhatsapp = [];
            this.chatWhatsappAssigned = [];
            data.forEach(d => {
                if(!d.agent && d.finished) this.chatWhatsapp.push(d);
                if (d.agent) {
                    this.chatWhatsapp.push(d);
                    for (let j = 0; j < d.assignTo.length; j++) {
                        if (d.assignTo[j].userId === this.userId && !d.finished) {
                            this.chatWhatsappAssigned.push(d);
                        }
                    }
                }
            })
        });
  }

  async getMessagesFromChatOnclick(data, assigned: boolean) {
      this.templatesActivated = false;
      this.templatesActivatedOptions = false;
      this.iAmAssigned = false;
      this.fetchData.checkWhatsapp24HourWindow({
        companyId: (this.companyId) ? this.companyId : data.companyId,
        number: data.number,
        api_url: (this.holdData.companyInfo.api_url) ? this.holdData.companyInfo.api_url : null
      }).toPromise()
      .then(dataSession => {
        if(dataSession === 'false') {
          this.templatesActivated = true;
          this.templatesActivatedOptions = true;
        }
        this.showPrivateChat = false;
        //only allow users that has been asigned
        if (!data.finished) {
          data.assignTo.forEach(element => {
              if (element.userId === this.holdData.userId) {
                  this.iAmAssigned = true;
              }
          });
        }
        // ask if i have permision to see this chat 
        if (!data.private) {
            //chat is public
            this.allowGetChatInformation(data, assigned);
            this.privateChat = false;
            if (this.iAmAssigned) this.showPrivateChat = true;
  
        } else if (data.private === true) {
            if (this.iAmAssigned) {
                this.allowGetChatInformation(data, assigned);
                this.privateChat = true;
                this.showPrivateChat = true;
            } else {
                this._snackBar.open('Este chat es privado y sólo podran acceder las personas asignadas', 'Ok', {
                    duration: 5000,
                });
            }
        }
      })
  }

  allowGetChatInformation(data, assigned: boolean) {
      this.showGeneralChat = true;
      //chat is allowed to see
      this.employeesAssignated = [];
      if (this.messageSubscription) this.messageSubscription.unsubscribe();
      if (this.commentsSubscription) this.commentsSubscription.unsubscribe();
      // get comments of this chat
      this.chatNote = null;
      this.firstTimeMsgLoad = true;
      this.chatMessages = [];
      this.currentChatData = {
          phoneNumber: data.number,
          finished: (data.finished) ? data.finished : false,
          ticketId: (data.ticketId) ? data.ticketId : null,
          assignTo: (data.assignTo) ? data.assignTo : null,
          hasTicket: (data.hasTicket) ? data.hasTicket : false,
          private: (data.private) ? data.private : false,
          chatName: (data.chatName) ? data.chatName:'Sin nombre',
          timestamp: data.timestamp
      }  
          
      //if the current chat has no one assigned do nothing
      if (this.currentChatData.assignTo) this.employeesAssignated = this.currentChatData.assignTo;

      this.messageSubscription = this.fetchData.getMessagesFromSpecificWChat(
              this.companyId,
              data.number
          )
          .subscribe((dataRta) => {
              const el = document.getElementById('content-messages');
              el.scrollTop = el.scrollHeight;
              dataRta.map(d => {
                  if (this.firstTimeMsgLoad === true) {
                      this.chatMessages.unshift({
                          ...d.payload.doc.data(),
                          MediaContentType: (d.payload.doc.data().MediaContentType) ?
                              (d.payload.doc.data().MediaContentType.includes('image')) ? 'image' : 'file' :
                              null
                      });
                  } else {
                      this.chatMessages.push({
                          ...d.payload.doc.data(),
                          MediaContentType: (d.payload.doc.data().MediaContentType) ?
                              (d.payload.doc.data().MediaContentType.includes('image')) ? 'image' : 'file' :
                              null
                      });
                  }

              })
              this.firstTimeMsgLoad = false;
          })
  }

  sendForm(formId: string) {
      let formData;
      this.fetchData.getMainMessageForm(this.companyId, formId)
          .toPromise()
          .then(async (data) => {
              data.forEach(main => {
                  formData = {
                      ...main.data(),
                      formId: formId,
                  }
              })
              await this.setData.setMainFormUser(this.companyId, this.currentChatData.phoneNumber, formData);
              this.setData.sendWhatsappMessageHttp({
                      message: formData.message,
                      number: this.currentChatData.phoneNumber,
                      template: this.templatesActivated,
                      companyId: this.companyId,
                      form: true,
                      api_url: (this.holdData.companyInfo.api_url) ? this.holdData.companyInfo.api_url : null
                  }).toPromise()
                  .then(data => {
                    this._snackBar.open('Formulario enviado. Revisa la información en la sección "formularios"', 'Ok', {
                        duration: 4000,
                    });
                  })
                  .catch(error => {
                      // console.log(error);
                  })
          })
  }

  sendMessage() {
      // check if chat is active
      this.fetchData.checkWhatsapp24HourWindow({
              companyId: this.companyId,
              number: this.currentChatData.phoneNumber,
              api_url: (this.holdData.companyInfo.api_url) ? this.holdData.companyInfo.api_url : null
          }).toPromise()
          .then(async (dataSession) => {
              if (dataSession === 'false') {
                  this.templatesActivated = true;
                  this.templatesActivatedOptions = true;
              }
              this.showSpinner = true;
              //send message in specific chat
              if (this.currentMessage !== undefined && this.currentMessage !== null && this.currentMessage.trim().length !== 0) {
                  // uncomment in production
                  let mediaUrl = null;
                  if (this.fileInfo) {
                      mediaUrl = await this.setData.uploadMediaFile(this.companyId, this.currentChatData.phoneNumber, this.fileInfo, this.fileName);
                  }
                  this.setData.sendWhatsappMessageHttp({
                          message: this.currentMessage,
                          number: this.currentChatData.phoneNumber,
                          template: this.templatesActivated,
                          companyId: this.companyId,
                          mediaUrl: mediaUrl,
                          api_url: (this.holdData.companyInfo.api_url) ? this.holdData.companyInfo.api_url : null
                      }).toPromise()
                      .then(async (data) => {
                          const timestamp = this.holdData.convertJSDateIntoFirestoreTimestamp();
                          let dataFirebase;
                          if (mediaUrl) {
                              dataFirebase = {
                                  inbound: false,
                                  message: this.currentMessage,
                                  timestamp: timestamp,
                                  mediaUrl: mediaUrl,
                                  MediaContentType: this.fileInfo.type
                              }
                              await this.setData.sendWhatsappMessageFirebase(this.companyId, this.currentChatData.phoneNumber, dataFirebase);
                          } else {
                              dataFirebase = {
                                  inbound: false,
                                  message: this.currentMessage,
                                  timestamp: timestamp,
                              }
                              await this.setData.sendWhatsappMessageFirebase(this.companyId, this.currentChatData.phoneNumber, dataFirebase);
                          }
                          this.currentMessage = null;
                          this.fileInfo = null;
                          this.fileName = '';
                          this.showSpinner = false;
                      })
                      .catch(error => {
                          if (error.status === 400) {
                              alert('No se puede enviar mensajes porque la empresa no tiene saldo suficiente');
                          } else {
                              console.log(error);
                              
                              alert('No pudimos enviar tu mensaje, si el error persiste por favor contáctanos a octo.colombia@gmail.com');
                          }
                          this.currentMessage = null;
                          this.fileInfo = null;
                          this.fileName = '';
                          this.showSpinner = false;
                      })
              } else if(this.voiceNote) {
                let mediaUrl;
                let randomName = this.holdData.createRandomId();
                randomName = `${randomName}.mpeg`
                mediaUrl = await this.setData.uploadMediaFile(this.companyId, this.currentChatData.phoneNumber, this.voiceNote, randomName);
                this.setData.sendWhatsappMessageHttp({
                        message: this.currentMessage,
                        number: this.currentChatData.phoneNumber,
                        template: this.templatesActivated,
                        companyId: this.companyId,
                        mediaUrl: mediaUrl,
                        api_url: (this.holdData.companyInfo.api_url) ? this.holdData.companyInfo.api_url : null
                    }).toPromise()
                    .then(async (data) => {
                        const timestamp = this.holdData.convertJSDateIntoFirestoreTimestamp();
                        let dataFirebase;
                        if (mediaUrl) {
                            dataFirebase = {
                                inbound: false,
                                message: this.currentMessage,
                                timestamp: timestamp,
                                mediaUrl: mediaUrl,
                                MediaContentType: 'file'
                            }
                            await this.setData.sendWhatsappMessageFirebase(this.companyId, this.currentChatData.phoneNumber, dataFirebase);
                        }                        
                        this.voiceNote = null;
                        this.showSpinner = false;
                    })
                    .catch(error => {
                        if (error.status === 400) {
                            alert('No se puede enviar mensajes porque la empresa no tiene saldo suficiente');
                        } else {
                            console.log(error);
                            alert('No pudimos enviar tu mensaje, si el error persiste por favor contáctanos a octo.colombia@gmail.com');
                        }
                        this.voiceNote = null;
                        this.showSpinner = false;
                    })
              } else {
                  this.currentMessage = null;
              }
          })
  }

  /*******************
  END OF ROOM CHAT
  *******************/


  templateSelected(template) {
      this.currentMessage = template;
      this.templatesActivated = false;
  }

  templateSelectedClose(template) {
    this.setData.sendWhatsappMessageHttp({
        message: template,
        number: this.currentChatData.phoneNumber,
        template: true,
        companyId: this.companyId,
        mediaUrl: null,
        api_url: (this.holdData.companyInfo.api_url) ? this.holdData.companyInfo.api_url : null
    }).toPromise()
    .then(async (data) => {
        const timestamp = this.holdData.convertJSDateIntoFirestoreTimestamp();
        let dataFirebase;
        dataFirebase = {
            inbound: false,
            message: template,
            timestamp: timestamp,
        }
        await this.setData.sendWhatsappMessageFirebase(this.companyId, this.currentChatData.phoneNumber, dataFirebase);
    })
    .catch(error => {
        if (error.status === 400) {
            alert('No se puede enviar mensajes porque la empresa no tiene saldo suficiente');
        } else {
            console.log(error);
            alert('No pudimos enviar tu mensaje, si el error persiste por favor contáctanos a octo.colombia@gmail.com');
        }
    })
  }

    showDates(chat){
        this.date = chat.timestamp;
        this.showDate = true;
    }

    hideDates(){
        this.showDate = false;
    }
    
    goToOpenChats(){
        this.router.navigate(['/whatsapp']);

    }
}