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
} from '../../../app/material-component/ticket-dialog/ticket-dialog.component';
import {
  MatSnackBar
} from '@angular/material/snack-bar';
import { DateAdapter, MAT_DATE_FORMATS, NativeDateAdapter } from '@angular/material/core';
import { formatDate } from '@angular/common';
import { addDays } from 'date-fns';
import Swal from 'sweetalert2'
import { DropFilesComponent } from '../../material-component/drop-files/drop-files.component';
import { AppHeaderComponent } from '../../layouts/full/header/header.component';
import { Howl } from 'howler';

export class currentChatData {
  phoneNumber: string;
  finished: boolean = false;
  ticketId: string;
  assignTo: any = [];
  recordAssignTo?: any = [];
  hasTicket: boolean = false;
  private: boolean = false;
  chatName?:string; 
  timestamp: any;
  formId?: string
  responseId?: string;
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
  selector: 'app-whatsapp',
  templateUrl: './whatsapp.component.html',
  styleUrls: ['./whatsapp.component.scss'],
  providers: [
    {provide: DateAdapter, useClass: PickDateAdapter},
    {provide: MAT_DATE_FORMATS, useValue: PICK_FORMATS}
  ]
})
export class WhatsappComponent implements OnInit {
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
  showAssignedChats: boolean = false;
  showGeneralChats: boolean = false;
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
  datePick: any;
  chatInfoSubscription: any;
  urlSelectedFile: any;
  responseBot: Array<string> = [];
  responseForm: Array<string> = [];
  public showLoadingOnChatOpening: boolean = false;
  public showSpinnerOnMessageLoading: boolean = false;
  public soundOn: boolean = false;
  eventNot: Event = new Event('not');
  
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
      public zone: NgZone
  ) {
      //getting info of chat if comes
    this.route.queryParams.subscribe(async() => {
        if (this.router.getCurrentNavigation().extras.state) {
            const currentNav = this.router.getCurrentNavigation().extras.state
            if (currentNav.data) {
                this.getMessagesFromChatOnclick(currentNav.data, false);
                //get a ticket from current chat
                this.getTicket(currentNav.data.companyId, currentNav.data.ticketId);
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
      this.getCategories();
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
                if (obj) {
                Object.keys(obj).forEach(k => {
                    this.templatesArray.push(obj[k]);
                });
                }
            });
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
      const timestampStart = this.holdData.convertJSCustomDateIntoFirestoreTimestamp(new Date("December 31, 1970 00:00:00"));
      const timestampEnd = this.holdData.convertJSCustomDateIntoFirestoreTimestamp(addDays(new Date(), 1));
      this.chatInfoSubscription = this.fetchData.getWhatsappChats(this.companyId, timestampStart, timestampEnd)
        .pipe(
            takeUntil(this.destroy$)
        )
        .subscribe(data => {
            data.forEach(d => {
                const indexChatRev = this.chatWhatsapp.findIndex(item => item.number === d.payload.doc.data().number);
                const indexChatAssignedRev = this.chatWhatsappAssigned.findIndex(item => item.number === d.payload.doc.data().number);
                if ((d.type === 'added' && indexChatRev === -1 && indexChatAssignedRev === -1) || 
                    (d.type === 'modified' && indexChatRev === -1 && indexChatAssignedRev === -1)) {
                    const docData = d.payload.doc.data();
                    if(!docData.agent && docData.finished) this.chatWhatsapp.push(docData);
                    if (docData.agent) {
                        d.type === 'added' ? this.chatWhatsapp.push(docData) : this.chatWhatsapp.unshift(docData);
                        for (let j = 0; j < docData.assignTo.length; j++) {
                            if (docData.assignTo[j].userId === this.userId && !docData.finished) {
                                d.type === 'added' ? this.chatWhatsappAssigned.push(docData) : this.chatWhatsappAssigned.unshift(docData);
                            }
                        }
                    }
                } else {
                    const docData = d.payload.doc.data();
                    if (docData.unseen && this.soundOn) document.documentElement.dispatchEvent(this.eventNot);
                    const indexChat = this.chatWhatsapp.findIndex(item => item.number === docData.number);
                    this.chatWhatsapp[indexChat] = docData;
                    const indexChatAssigned = this.chatWhatsappAssigned.findIndex(item => item.number === docData.number);
                    if (indexChatAssigned !== null && indexChatAssigned !== undefined) {
                        this.chatWhatsappAssigned[indexChatAssigned] = docData;
                    }
                }
            })
        });
  }

  dateFilter(){
    if (this.chatInfoSubscription) this.chatInfoSubscription.unsubscribe();
    this.chatWhatsapp = [];
    this.chatWhatsappAssigned = [];
    const timestampStart = this.holdData.convertJSCustomDateIntoFirestoreTimestamp(this.datePick.begin);
    const timestampEnd = this.holdData.convertJSCustomDateIntoFirestoreTimestamp(this.datePick.end);
      this.chatInfoSubscription = this.fetchData.getWhatsappChats(this.companyId, timestampStart, timestampEnd)
        .pipe(
            takeUntil(this.destroy$)
        )
        .subscribe(data => {
            data.forEach(d => {
                const indexChatRev = this.chatWhatsapp.findIndex(item => item.number === d.payload.doc.data().number);
                const indexChatAssignedRev = this.chatWhatsappAssigned.findIndex(item => item.number === d.payload.doc.data().number);
                if ((d.type === 'added' && indexChatRev === -1 && indexChatAssignedRev === -1) || 
                (d.type === 'modified' && indexChatRev === -1 && indexChatAssignedRev === -1)) {
                    const docData = d.payload.doc.data();
                    if(!docData.agent && docData.finished) this.chatWhatsapp.push(docData);
                    if (docData.agent) {
                        d.type === 'added' ? this.chatWhatsapp.push(docData) : this.chatWhatsapp.unshift(docData);
                        for (let j = 0; j < docData.assignTo.length; j++) {
                            if (docData.assignTo[j].userId === this.userId && !docData.finished) {
                                d.type === 'added' ? this.chatWhatsappAssigned.push(docData) : this.chatWhatsappAssigned.unshift(docData);
                            }
                        }
                    }
                } else {
                    const docData = d.payload.doc.data();
                    if (docData.unseen && this.soundOn) document.documentElement.dispatchEvent(this.eventNot);
                    const indexChat = this.chatWhatsapp.findIndex(item => item.number === docData.number);
                    this.chatWhatsapp[indexChat] = docData;
                    const indexChatAssigned = this.chatWhatsappAssigned.findIndex(item => item.number === docData.number);
                    if (indexChatAssigned !== null && indexChatAssigned !== undefined) {
                        this.chatWhatsappAssigned[indexChatAssigned] = docData;
                    }
                }
            })
        });
  }

  private actionsAmongChatOpenings(data?) {
    //chat is allowed to see
    this.employeesAssignated = [];
    if (this.messageSubscription) this.messageSubscription.unsubscribe();
    if (this.commentsSubscription) this.commentsSubscription.unsubscribe();
    // get comments of this chat
    this.chatNote = null;
    this.firstTimeMsgLoad = true;
    this.chatMessages = [];
    this.templatesActivated = false;
    this.templatesActivatedOptions = false;
    this.iAmAssigned = false;
    this.showGeneralChats = false;
    this.showAssignedChats = false;
    this.showLoadingOnChatOpening = true;
    this.chatWhatsapp.forEach((item, index) => {
        if (item.number === data.number) this.chatWhatsapp[index].unseen = false;
    });
    this.chatWhatsappAssigned.forEach((item, index) => {
        if (item.number === data.number) this.chatWhatsappAssigned[index].unseen = false;
    });
  }

  async getMessagesFromChatOnclick(data, assigned: boolean) {
    //   //chat is allowed to see
    //   this.employeesAssignated = [];
    //   if (this.messageSubscription) this.messageSubscription.unsubscribe();
    //   if (this.commentsSubscription) this.commentsSubscription.unsubscribe();
    //   // get comments of this chat
    //   this.chatNote = null;
    //   this.firstTimeMsgLoad = true;
    //   this.chatMessages = [];
    //   this.templatesActivated = false;
    //   this.templatesActivatedOptions = false;
    //   this.iAmAssigned = false;
    //   this.showGeneralChats = false;
    //   this.showAssignedChats = false;
    //   this.showLoadingOnChatOpening = true;
      this.actionsAmongChatOpenings(data);    
      this.fetchData.checkWhatsapp24HourWindow({
        companyId: (this.companyId) ? this.companyId : data.companyId,
        number: data.number,
        api_url: (this.holdData.companyInfo.api_url) ? this.holdData.companyInfo.api_url : null
      }).toPromise()
      .then(dataSession => {
        this.showLoadingOnChatOpening = false;
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
      .catch(async error => {
        this.showLoadingOnChatOpening = false;
        const dataError = {
            message: error.message,
            name: error.name,
            ok: error.ok,
            status: error.status,
            statusText: error.name,
            url: error.url
        };
        await this.setData.setError(this.companyId, dataError);
        Swal.fire(
            'Hubo un error cargando los mensajes', 
            'Por favor intenta de nuevo',
            'error'
        ).then(data => {
            this.actionsAmongChatOpenings();    
        });
      })
  }

allowGetChatInformation(data, assigned: boolean) {
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
          recordAssignTo: (data.recordAssignTo) ? data.recordAssignTo : null,
          hasTicket: (data.hasTicket) ? data.hasTicket : false,
          private: (data.private) ? data.private : false,
          chatName: (data.chatName) ? data.chatName:'Sin nombre',
          timestamp: data.timestamp,
          formId: (data.formId) ? data.formId : null,
          responseId: (data.responseId) ? data.responseId : null,
      }      
      //if the current chat has no one assigned do nothing
      if (this.currentChatData.assignTo) this.employeesAssignated = this.currentChatData.assignTo;
      // fetch the ticket of the specific Chat
      if (assigned === true) {
          this.showAssignedChats = true;
          this.showGeneralChats = false;
      } else {
          this.showGeneralChats = true;
          this.showAssignedChats = false;
      }
      this.getTagsFromConversation(data.number);
      this.showSpinnerOnMessageLoading = true; 
      this.messageSubscription = this.fetchData.getMessagesFromSpecificWChat(
            this.companyId,
            data.number
        )
        .subscribe((dataRta) => {  
            this.showSpinnerOnMessageLoading = false;           
            if (this.showGeneralChats) {
                const el = document.getElementById('content-messages');
                el.scrollTop = el.scrollHeight;
            } else if (this.showAssignedChats) {
                const el = document.getElementById('content-messages-private');
                el.scrollTop = el.scrollHeight;
            }
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
            });
            this.firstTimeMsgLoad = false;
        }, async error => {
            this.showSpinnerOnMessageLoading = false;   
            this.actionsAmongChatOpenings();
            const dataError = {
                message: error.message,
                name: error.name,
                ok: error.ok,
                status: error.status,
                statusText: error.name,
                url: error.url
            };
            await this.setData.setError(this.companyId, dataError);
            Swal.fire(
                'Hubo un error cargando los mensajes de este chat', 
                'Por favor intenta de nuevo',
                'error'
            ).then(data => {
                this.actionsAmongChatOpenings();    
            })
        })
    // set unseen flag to false
    this.setData.setUnseenToFalse(this.companyId, this.currentChatData.phoneNumber);
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

  async sendMessage() {
      try {
        const dataSession = await this.fetchData.checkWhatsapp24HourWindow({
            companyId: this.companyId,
            number: this.currentChatData.phoneNumber,
            api_url: (this.holdData.companyInfo.api_url) ? this.holdData.companyInfo.api_url : null
        }).toPromise();
        if (dataSession === 'false') {
            this.templatesActivated = true;
            this.templatesActivatedOptions = true;
        }
        this.showSpinner = true;
        // upload file if file
        let mediaUrl = null;
        if (this.fileInfo) {
            // this.urlSelectedFile.typeImage ? console.log('image') : console.log('other');
            mediaUrl = await this.setData.uploadMediaFile(this.companyId, this.currentChatData.phoneNumber, this.fileInfo, this.fileName);
            if (this.currentMessage.length <= 1) this.currentMessage = 'Imagen';
        }
        if (!this.fileInfo || (this.fileInfo && this.urlSelectedFile.typeImage)) {
            //send message in specific chat
            if (this.currentMessage !== undefined && this.currentMessage !== null && this.currentMessage.trim().length !== 0) {
              const data = await this.setData.sendWhatsappMessageHttp({
                  message: this.currentMessage,
                  number: this.currentChatData.phoneNumber,
                  template: this.templatesActivated,
                  companyId: this.companyId,
                  mediaUrl: mediaUrl,
                  api_url: (this.holdData.companyInfo.api_url) ? this.holdData.companyInfo.api_url : null
              }).toPromise();
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
    
            } 
            
            // else if(this.voiceNote) {
            //   let mediaUrl;
            //   let randomName = this.holdData.createRandomId();
            //   randomName = `${randomName}.mpeg`
            //   mediaUrl = await this.setData.uploadMediaFile(this.companyId, this.currentChatData.phoneNumber, this.voiceNote, randomName);
            //   const data = await this.setData.sendWhatsappMessageHttp({
            //       message: this.currentMessage,
            //       number: this.currentChatData.phoneNumber,
            //       template: this.templatesActivated,
            //       companyId: this.companyId,
            //       mediaUrl: mediaUrl,
            //       api_url: (this.holdData.companyInfo.api_url) ? this.holdData.companyInfo.api_url : null
            //   }).toPromise();
            //   const timestamp = this.holdData.convertJSDateIntoFirestoreTimestamp();
            //   let dataFirebase;
            //   if (mediaUrl) {
            //       dataFirebase = {
            //           inbound: false,
            //           message: this.currentMessage,
            //           timestamp: timestamp,
            //           mediaUrl: mediaUrl,
            //           MediaContentType: 'file'
            //       }
            //       await this.setData.sendWhatsappMessageFirebase(this.companyId, this.currentChatData.phoneNumber, dataFirebase);
            //   }                        
            //   this.voiceNote = null;
            //   this.showSpinner = false;
            // } 
            
            else {
              this.currentMessage = null;
              this.showSpinner = false;
            }
        } else {
            // there is a file different than image
            const dialogRef = this.dialog.open(DropFilesComponent, {
                minWidth: "200px",
                height: "250px",
                panelClass: 'drop-files-dialog',
                data: {
                    uploadFile: true,
                    fileUrl: mediaUrl
                }
            });
            this.showSpinner = false;
        }
      } catch(error) {
        if (error.status === 400) {
            Swal.fire(
                'No se puede enviar mensajes', 
                'La empresa no tiene saldo suficiente',
                'error'
            );
        } else {
            const dataError = {
                message: error.message,
                name: error.name,
                ok: error.ok,
                status: error.status,
                statusText: error.name,
                url: error.url
            };
            await this.setData.setError(this.companyId, dataError);
            Swal.fire(
                'No pudimos enviar tu mensaje', 
                'Si el error persiste por favor contáctanos a daniel@octochat.co',
                'error'
            );
        }
        this.currentMessage = null;
        this.fileInfo = null;
        this.fileName = '';
        this.showSpinner = false;
        this.voiceNote = null;
      }
  }

  /*******************
  END OF ROOM CHAT
  *******************/

  // ------------------------------------
  triggerResize() {
      // Wait for changes to be applied, then trigger textarea resize.
      this._ngZone.onStable.pipe(take(1))
          .subscribe(() => this.autosize.resizeToFitContent(true));
  }

  getCategories() {
      // get categories 
      this.fetchData.getTags(this.companyId)
          .pipe(
              takeUntil(this.destroy$)
          )
          .subscribe(data => {
            data.forEach(d => {
              if (d.name) this.tagsCategoriesNames.push(d)
            })
          })
  }

  getSpecificTags(category) {
      this.fetchData.getSpecificTag(category.categoryId, this.companyId)
          .pipe(
              takeUntil(this.destroy$)
          ).subscribe(data => {
              this.tagsCategories = data;
          })
  }

  getTagsFromConversation(number) {
      this.fetchData.getTagFromConversation(number, this.companyId)
          .pipe(
              takeUntil(this.destroy$)
          )
          .subscribe(data => {
              this.tagsFromConversation = data;
          })
  }

  remove(tag) {
      this.deleteData.deleteTagCounter(this.companyId, tag.categoryId, tag.tagId, this.currentChatData.phoneNumber);
  }

  selected(tag) {
      const tagData = {
          ...tag,
          times: (tag.times) ? tag.times : 0
      }
      //save tag to whatsapp conversation
      this.setData.sendTag(this.companyId, this.currentChatData.phoneNumber, tagData);
      this.setData.addToTagCounter(this.companyId, tagData);
      this.tagsCategories = [];
  }

  private _filter(value: string): string[] {
      const filterValue = value.toLowerCase();
      return this.tagsCategories.filter(tag =>
          tag.toLowerCase().indexOf(filterValue) === 0);
  }

  goToTags() {
      this.router.navigate(['/tags']);
  }

  goToStatistics() {
      this.router.navigate(['/tag-metrics']);
  }

  onTabChanged() {
      this.showAssignedChats = false;
      this.showGeneralChats = false;
      this.fileInfo = null;
      this.urlSelectedFile = null;
      this.currentMessage = null;
  }

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
    .catch(async error => {
        if (error.status === 400) {
            Swal.fire(
                'No se puede enviar mensajes', 
                'La empresa no tiene saldo suficiente',
                'error'
            );
          } else {
            const dataError = {
                message: error.message,
                name: error.name,
                ok: error.ok,
                status: error.status,
                statusText: error.name,
                url: error.url
            };
            await this.setData.setError(this.companyId, dataError);
            Swal.fire(
                'No pudimos enviar tu mensaje', 
                'Si el error persiste por favor contáctanos a daniel@octochat.co',
                'error'
            );
          }
    })
  }

  displayImage(url: string) {
      window.open(url, "_blank");
  }

//   selectImage(file) {
//       this.fileInfo = file.target.files[0];
//       let reader = new FileReader();
//       reader.readAsDataURL(this.fileInfo);
//       reader.onload = () => {
//         this.urlSelectedFile = {
//             url: reader.result,
//             typeImage: file.target.files[0].type.includes('image') ? true : false
//         };
//       }
//       this.fileName = file.target.files[0].name;
//   }

  setChatNote() {
      if (this.chatNote) {
          const data = {
              agent: `${this.holdData.userInfo.name} ${this.holdData.userInfo.lastname}`,
              body: this.chatNote,
              companyId: this.companyId,
              ticketId: this.currentChatData.ticketId,
              timestamp: this.holdData.convertJSDateIntoFirestoreTimestamp()
          }
          // send comment
          this.setData.sendChatComment(data).catch(e => {console.error(e)})
          this.chatNote = null;
      }
  }

  async archiveChat() {
    // finish chat and remove agent from chat    
    await this.setData.archiveChat({
        companyId: this.companyId,
        number: this.currentChatData.phoneNumber,
        timestamp: this.currentChatData.timestamp,
        assignTo: this.currentChatData.assignTo,
        recordAssignTo: this.currentChatData.recordAssignTo,
    })
    const indexChatRev = this.chatWhatsapp.findIndex(item => item.number === this.currentChatData.phoneNumber);
    const indexChatAssignedRev = this.chatWhatsappAssigned.findIndex(item => item.number === this.currentChatData.phoneNumber);
    if (indexChatRev !== -1) this.chatWhatsapp.splice(indexChatRev, 1);
    if (indexChatAssignedRev !== -1) this.chatWhatsappAssigned.splice(indexChatAssignedRev, 1);
    // hide user interface 
    this.showDetail = false;
    this.showAssignedChats = false;
    this.showGeneralChats = false;
  }

  showQuickResponses() {
      // show pre-saved messages (quick responses)
      const dialogRef = this.dialog.open(QuickResponsesDialogComponent);
      dialogRef.afterClosed()
          .subscribe(result => {
              if (result.event !== 'cancel') {
                  this.currentMessage = result.data;
              }
          })
  }

  getEmployees() {
      //get all the company employees
      this.fetchData.getCompanyEmployees(this.holdData.userInfo.companyId)
          .subscribe(data => {
              data.map(e => {
                  const data = e.payload.doc.data();
                  this.employees.push(data);
              })
          })
  }

  getTicket(companyId?: string, ticketId?: string) {
    if (this.commentsSubscription) this.commentsSubscription.unsubscribe();
    //get a ticket from current chat
    if (companyId && ticketId) {
        this.fetchData.getTicket(companyId, ticketId)
            .pipe(
                takeUntil(this.destroy$)
            ).subscribe(data => {
                this.ticket = data.data();
                //make the select component show the status automaticly
                this.status = this.ticket.status
                this.showTicket = true;
                this.showDetail = false;
            })
        this.fetchData.getCommentsChat({
            companyId: companyId,
            ticketId: ticketId
        }).pipe(
            takeUntil(this.destroy$)
        ).subscribe(data => {
            this.commentsChat = data;
        })
    } else {
        this.fetchData.getTicket(this.companyId, this.currentChatData.ticketId)
        .pipe(
            takeUntil(this.destroy$)
        ).subscribe(data => {
            this.ticket = data.data();
            //make the select component show the status automaticly
            this.status = this.ticket.status
            this.showTicket = true;
            this.showDetail = false;
        })
        this.commentsSubscription = this.fetchData.getCommentsChat({
            companyId: this.companyId,
            ticketId: this.currentChatData.ticketId
        }).pipe(
            takeUntil(this.destroy$)
        ).subscribe(data => {
            this.commentsChat = data;
        })
    }
  }

  createTicket() {
      const dialogRef = this.dialog.open(TicketDialogComponent);
      dialogRef.afterClosed()
        .subscribe(async result => {
            // create new chat room 
            if (result.event === 'Cancel' || result.event === undefined) {} else if (result.event === 'Success') {
                let ticket = result.data;
                ticket.phone = this.currentChatData.phoneNumber;
                ticket.status = 'Pendiente';
                const ticketId: any = await this.setData.createTicket(ticket, this.companyId);
                this.setData.sendHasTicket(this.currentChatData.phoneNumber, this.companyId, ticketId);
                this.showDetail = false;
                //agregar snackbar
                this.currentChatData = {...this.currentChatData, hasTicket: true, ticketId: ticketId};
                this.getTicket();
                this._snackBar.open('Creación exitosa', 'Ok', {
                    duration: 3000,
                });
            }
        });
  }

  async addPerson(person) {
      this.employeesAssignated.push(person);
      await this.setData.setAssignedpeople(this.companyId, this.currentChatData.phoneNumber, this.employeesAssignated, person);
      this.showAssignedChats = false;
      this.showTicket = false;
      if (person.userId === this.holdData.userId) {
          window.location.reload();
          this.showPrivateChat = true;
      }
      this._snackBar.open('Nueva persona agregada al chat', 'Ok', {
          duration: 5000,
      });
  }

  async removePersonAssigned(person) {
      const index = this.employeesAssignated.indexOf(person);
      if (index >= 0) {
        const dataRemoved = this.employeesAssignated.splice(index, 1);
        this.setData.setAssignedpeople(this.companyId, this.currentChatData.phoneNumber, this.employeesAssignated, null);
        // set record of agent assigned
        await this.setData.saveAgentsRecord(this.companyId, this.currentChatData.phoneNumber, dataRemoved[0]);
      }
  }

  chatPrivateMode() {
      //make the chat go into private mode 
      this.setData.makeChatPrivate(this.currentChatData.phoneNumber, this.companyId)
      this._snackBar.open('Este chat esta en modo privado, sólo las personas asignadas podrán tener acceso', 'Ok', {
          duration: 5000,
      });
  }

  chatPublicMode() {
      //make the chat go into public mode 
      // verify if user is assigned to the chat
      this.setData.makeChatPublic(this.currentChatData.phoneNumber, this.companyId);
      this._snackBar.open('Este chat esta en modo público, todo tu equipo podrá acceder a el', 'Ok', {
          duration: 5000,
      });
  }

  checkboxEvent() {
      if (this.privateChat === true) {
          this.chatPublicMode();
      } else if (this.privateChat === false) {
          this.chatPrivateMode();
      }
  }

  ticketStatus(status) {      
      this.setData.setStatus(this.companyId, this.currentChatData.ticketId, status, this.currentChatData.phoneNumber);
      this.ticket.status = status;
      if(status === 'Completado') {
          let ticketId =this.currentChatData.ticketId
        this.setData.setCommentsOnChatClosed(this.companyId,ticketId,this.commentsChat);
        this.currentChatData = {
            ...this.currentChatData,
            hasTicket: false,
            ticketId: 'no ticket',
        }
        this.showTicket = false;
        this.archiveChat();
        if(this.sendFormOnTicketClose) {
            this.sendForm(this.formOnTicket.formId);
        }
      }
  }

  showDetails() {
      this.showDetail = true;
      this.showTicket = false;
  }

  closeDetailsBox(){
    this.showDetail = false;
    this.showAssignedChats = false;
    this.showGeneralChats = false;
  }
  createAlias(name){
      //create a name for the chat
      this.setData.changeNameOfChat(this.currentChatData.phoneNumber, this.companyId,name)
      this._snackBar.open('Cambio exitoso', 'Ok', {
          duration: 5000,
      });
      this.currentChatData.chatName = name;
      this.name = '';
  }

    startVoiceRecording() {
        this.showMic = false;
        let time; 
        navigator.mediaDevices.getUserMedia({ audio: true })
            .then(stream => {
                this.mediaRecorder = new MediaRecorder(stream);
                this.mediaRecorder.start();
                const audioChunks = [];
                this.mediaRecorder.addEventListener("dataavailable", event => {
                  audioChunks.push(event.data);
                });
                this.mediaRecorder.addEventListener("stop", () => {
                    this.voiceNote = new Blob(audioChunks, {'type': 'audio/mp3'});
                    clearInterval(time);
                    if(this.saveAudio) {
                        this.sendMessage();
                    }
                });
                time = setInterval(()=> {
                    this.timeRecorded++
                }, 1000)
            });
    }

    sendVoiceNote() {
        this.saveAudio = true;
        this.mediaRecorder.stop();
        this.timeRecorded = 0;
        this.showMic = true;
    }

    cancelVoiceNote() {
        this.mediaRecorder.stop();
        this.timeRecorded = 0;
        this.showMic = true;
    }
    
    goToClosedChats(){
        this.router.navigate(['/closedchats']);
    }

    async getBotResponses() {
        const data = await this.fetchData.getSingleWhatsappChat(this.companyId, this.currentChatData.phoneNumber).toPromise();
        this.responseBot = data.data().responseBot;
    }

    async getFormResponses() {
        const responseFormData = await this.fetchData.getSingleResultForms(this.companyId, {
            formId: this.currentChatData.formId,
            responseId: this.currentChatData.responseId
        });
        this.responseForm = Object.keys(responseFormData.results).map((key) => {
            return `${key} : ${responseFormData.results[key]}`;
        });
    }

    openDropFile() {
        const dialogRef = this.dialog.open(DropFilesComponent, {
            minWidth: "500px",
            height: "550px",
            panelClass: 'drop-files-dialog',
            data: {
                uploadFile: false,
            }
        });
        dialogRef.afterClosed()
        .subscribe(result => {
            if (result.event !== 'cancel') {
                this.fileInfo = result.files[0];                
                let reader = new FileReader();
                reader.readAsDataURL(this.fileInfo);
                reader.onload = () => {
                    this.urlSelectedFile = {
                        url: reader.result,
                        typeImage: result.files[0].type.includes('image') ? true : false
                    };
                }
                this.fileName = result.files[0].name;
            }
        })
    }

    getBackgroundColorForms(chat) {
        /**
         * Set backgroundcolor to those chats with 'Domicilios' form for Hot Restaurante
         */
        if (chat.formId && chat.formId === 'fwerUhfI0IY2CMKuwgME' && this.companyId === 'AUj8qk9hf8p04kSYi6sj') {
            return '#F6D07F';
        }
    }

    turnSound() {
        this.soundOn = !this.soundOn;
        if (this.soundOn) {
            this.allowSound();
        } else {
            this.disallowSound();
        }
    }

    private allowSound() {
        this.soundOn = true;
        const audioHowl = new Howl({
          src: ['../../../assets/images/sounds/piece-of-cake.mp3']
        });
        document.documentElement.addEventListener("not", () => {
          audioHowl.play();
        })
      }
    
    private disallowSound() {
        this.soundOn = false;
        document.documentElement.removeEventListener("not", () => {})
      }
}