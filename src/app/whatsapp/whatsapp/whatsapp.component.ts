import { Component, OnInit, ViewChild, NgZone } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';

import { FecthDataService } from '../../core/services/fecth-data.service';
import { SetDataService } from '../../core/services/set-data.service';
import { DeleteDataService } from '../../core/services/delete-data.service';

import { takeUntil, take } from 'rxjs/operators';
import { Subject } from 'rxjs';
import { HoldDataService } from '../../core/services/hold-data.service';
import { CdkTextareaAutosize } from '@angular/cdk/text-field';
import { Router } from '@angular/router';

import { Howl } from 'howler';

export class currentChatData {
  phoneNumber:string;
  assignedTo:string = 'null';
  finished: boolean = false
}

@Component({
  selector: 'app-whatsapp',
  templateUrl: './whatsapp.component.html',
  styleUrls: ['./whatsapp.component.scss']
})
export class WhatsappComponent implements OnInit {
  @ViewChild('autosize') autosize: CdkTextareaAutosize;

  destroy$: Subject<void> = new Subject();
  destroyMsgSubs$: Subject<void> = new Subject();

  userId:string;
  companyId:string;
  chatWhatsapp:Array<any> = [];  // list of names of rooms
  chatWhatsappAssigned:Array<any> = [];  // list of names of rooms
  chatMessages: Array<any> = []; // array of messages of specific room
  currentMessage:string = null; // message to be send
  currentChatData: currentChatData;  // information of selected room chat
  showDetail: boolean = false;
  showAssignedChats:boolean=false;
  showGeneralChats:boolean=false;
  WMessages: number;
  WSenders: number;
  chat:any;
  employeesList:Array<any> = [];
  templatesArray:Array<any> = [];
  templatesActivated: boolean = false;
  templatesActivatedOptions: boolean = false;
  fileName: string;
  fileInfo: any;
  chatNote: string;
  showSpinner: boolean = false;
  firstTimeMsgLoad: boolean = false;
  commentsChat: Array<any> = [];
  isAdmin: boolean = false;
  tagsCategories:any = [];
  tagsCategoriesNames:any = [];
  tagsFromConversation:any = [];
  firstTimePrivateMsgLoad: boolean = false;
  commentsSubscription:any;
  messageSubscription:any;
  formsAlias: Array<any> = [];

  visible = true;
  selectable = true;
  removable = true;

  event: Event = new Event('not');

  constructor(
    private fetchData: FecthDataService,
    private setData: SetDataService,
    private holdData: HoldDataService,
    private deleteData: DeleteDataService,
    // UI components
    public dialog: MatDialog,
    private _ngZone: NgZone,
    private router: Router,
  ) { }

  ngOnDestroy(){
    this.destroy$.next();
    this.destroy$.complete();
    if(this.messageSubscription && this.commentsSubscription) {
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
    this.getWhatsappQuota();
  } 
  this.getChatWhatsappNames();
  this.getCompanyEmployees();
  this.getWhatsappTemplateMessages();
  this.getCategories();
  this.getForms();
}

createChat(){
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
          name: `${rta.name} ${rta.lastname}`
        }
        this.employeesList.push(data);
      })
    })
}

allowSound() {
  const audioHowl = new Howl({
    src: ['../../../assets/images/sounds/piece-of-cake.mp3']
  });
  audioHowl.play();
}

getWhatsappTemplateMessages() {
  // get whatsapp approve templates  
  if (this.holdData.companyInfo.api_url) {
    this.fetchData.getWhatsappTemplates(this.companyId, true)
      .subscribe(data =>{
        let obj = data.data();
        Object.keys(obj).forEach(k => {
          this.templatesArray.push(obj[k]);
        })
      })
  }else {
    this.fetchData.getWhatsappTemplates(this.companyId, false)
      .subscribe(data =>{
        let obj = data.data();
        Object.keys(obj).forEach(k => {
          this.templatesArray.push(obj[k]);
        })
      })
  }
}

getWhatsappQuota() {
  // get quota of whatsapp
  this.fetchData.getWhatsappQuota(this.companyId)
  .pipe(
    takeUntil(this.destroy$)
  )
  .subscribe(data => {
    const rta: any = data;
    this.WMessages = rta.messages;
    this.WSenders = rta.senders; 
  })
}

/*******************
ROOM CHAT
*******************/
getChatWhatsappNames(){
  // get chat rooms names
  this.fetchData.getWhatsappChats(this.companyId)
  .pipe(
    takeUntil(this.destroy$)
  )
  .subscribe(data => {
    this.chatWhatsapp = data;
    this.chatWhatsappAssigned = this.chatWhatsapp.filter(c => c.assignedTo === this.userId);  
  });
}

async getMessagesFromChatOnclick(data, assigned: boolean) {
  if (this.messageSubscription) this.messageSubscription.unsubscribe();
  if (this.commentsSubscription) this.commentsSubscription.unsubscribe();
  this.templatesActivated = false;
  this.templatesActivatedOptions = false;
  // get comments of this chat
  this.chatNote = null;
  this.commentsSubscription = this.fetchData.getCommentsChat({
    companyId: this.companyId,
    number: data.number
  }).subscribe(data => {
    this.commentsChat = data;
  })
  this.fetchData.checkWhatsapp24HourWindow({
    companyId: this.companyId,
    number: data.number,
    api_url: (this.holdData.companyInfo.api_url) ? this.holdData.companyInfo.api_url : null
  }).toPromise()
  .then(dataSession => {
    if(dataSession === 'false') {
      this.templatesActivated = true;
      this.templatesActivatedOptions = true;
    } 
    this.firstTimeMsgLoad = true;
    this.chatMessages = [];
    this.currentChatData = {
      phoneNumber: data.number,
      finished: (data.finished) ? data.finished : false,
      assignedTo: (data.assignedTo) ? data.assignedTo : 'null'
    }
    if (assigned === true) {
      this.showAssignedChats=true;
      this.showGeneralChats=false;
    }else {
      this.showGeneralChats=true;
      this.showAssignedChats=false;
    }
    this.getTagsFromConversation(data.number);
    this.messageSubscription = this.fetchData.getMessagesFromSpecificWChat(
      this.companyId, 
      data.number
    )
    .subscribe((dataRta) => {
      if(data.agent && !data.assignedTo) this.allowSound();
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
            MediaContentType: (d.payload.doc.data().MediaContentType) 
              ? (d.payload.doc.data().MediaContentType.includes('image')) ? 'image' : 'file'
              : null
          });
        } else{
          this.chatMessages.push({
            ...d.payload.doc.data(),
            MediaContentType: (d.payload.doc.data().MediaContentType) 
              ? (d.payload.doc.data().MediaContentType.includes('image')) ? 'image' : 'file'
              : null
          });
        }
        
      })      
      this.firstTimeMsgLoad = false;
    })
  })
  // .catch(error => {
  //   console.error(error);
  // })
}

sendForm(formId: string) {
  this.archiveChat();
  let formData;
  this.fetchData.getMainMessageForm(this.companyId, formId)
    .toPromise()
    .then(async(data) => {
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
        console.log('form sent', data);
      })
      .catch(error => {
        console.log(error);
      })
    })
}

sendMessage(){
  // check if chat is active
  this.fetchData.checkWhatsapp24HourWindow({
    companyId: this.companyId,
    number: this.currentChatData.phoneNumber,
    api_url: (this.holdData.companyInfo.api_url) ? this.holdData.companyInfo.api_url : null
  }).toPromise()
  .then(async(dataSession) => {
    if(dataSession === 'false') {
      this.templatesActivated = true;
      this.templatesActivatedOptions = true;
    } 
    this.showSpinner = true;
    //send message in specific chat
    if(this.currentMessage !== undefined && this.currentMessage !== null && this.currentMessage.trim().length !== 0) {
      // uncomment in production
      let mediaUrl = null;
      if(this.fileInfo) {
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
        // console.log(error);
        
        if(error.status === 400) {
          alert('No se puede enviar mensajes porque la empresa no tiene saldo suficiente');
        } else {
          alert('No pudimos enviar tu mensaje, si el error persiste por favor contáctanos a octo.colombia@gmail.com');
        }
        this.currentMessage = null;
        this.fileInfo = null;
        this.fileName = '';
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
 
  // ------------------------------------
  triggerResize() {
    // Wait for changes to be applied, then trigger textarea resize.
    this._ngZone.onStable.pipe(take(1))
        .subscribe(() => this.autosize.resizeToFitContent(true));
  }


  assignChat(data){
    //if chat is not assigned can be assigned    
    this.setData.assignWhatsappChat(this.companyId, this.currentChatData.phoneNumber, {
      userId: data.userId,
      name: data.name
    });
    this.currentChatData.assignedTo = data.userId;
    this.showAssignedChats = false;
    this.showGeneralChats = false;
    this.showDetail = false;
  }

  getCategories(){
    // get categories 
    this.fetchData.getTags(this.companyId)
    .pipe(
      takeUntil(this.destroy$)
    )
    .subscribe(data => {
      this.tagsCategoriesNames = data;        
      
    })
  }

  getSpecificTags(category){
    this.fetchData.getSpecificTag(category.categoryId,this.companyId)
    .pipe(
      takeUntil(this.destroy$)
    ).subscribe(data => {
      this.tagsCategories = data;
  })
}

getTagsFromConversation(number){
  this.fetchData.getTagFromConversation(number,this.companyId)
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
  this.setData.sendTag(this.companyId, this.currentChatData.phoneNumber,tagData );
  this.setData.addToTagCounter(this.companyId,tagData );
  this.tagsCategories = [];
}

private _filter(value: string): string[] {
  const filterValue = value.toLowerCase();
  return this.tagsCategories.filter(tag => 
    tag.toLowerCase().indexOf(filterValue) === 0);
}

goToTags(){
  this.router.navigate(['/tags']);
}

goToStatistics(){
  this.router.navigate(['/tag-metrics']);
}

  onTabChanged(){
    this.showAssignedChats = false;
    this.showGeneralChats = false;
  }

  templateSelected(template) {
    this.currentMessage = template;
    this.templatesActivated = false;
  }

  displayImage(url: string){
    window.open(url, "_blank");
  }

  selectImage(file) {
    this.fileInfo = file.target.files[0];
    this.fileName = file.target.files[0].name;
  }

  setChatNote(){
    if(this.chatNote) {
      const data = {
        agent: `${this.holdData.userInfo.name} ${this.holdData.userInfo.lastname}`,
        body: this.chatNote,
        companyId: this.companyId,
        number: this.currentChatData.phoneNumber,
        timestamp: this.holdData.convertJSDateIntoFirestoreTimestamp()
      }
      // send comment
      this.setData.sendChatComment(data);
      this.chatNote = null;
    }
  }

  async archiveChat(){
    // finish chat and remove agent from chat
    await this.setData.archiveChat({
      companyId: this.companyId,
      number: this.currentChatData.phoneNumber
    })
    this.showDetail = false;
  }
}

