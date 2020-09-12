import { Component, OnInit, ViewChild, NgZone, ChangeDetectionStrategy, ElementRef } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';

import { FecthDataService } from '../../core/services/fecth-data.service';
import { SetDataService } from '../../core/services/set-data.service';
import { DeleteDataService } from '../../core/services/delete-data.service';

import { takeUntil, take, startWith, map } from 'rxjs/operators';
import { Subject, Observable } from 'rxjs';
import { HoldDataService } from '../../core/services/hold-data.service';
import { CdkTextareaAutosize } from '@angular/cdk/text-field';
import { Router, ActivatedRoute } from '@angular/router';
import { FormControl } from '@angular/forms';
import {COMMA, ENTER} from '@angular/cdk/keycodes';
import { MatAutocomplete, MatAutocompleteSelectedEvent } from '@angular/material/autocomplete';
import { MatChipInputEvent } from '@angular/material/chips';

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
  typesOfShoes: string[] = ['Boots', 'Clogs', 'Loafers', 'Moccasins', 'Sneakers'];

  ///////////////////ONLY FOR EXAMPLE///////////////////////7
  visible = true;
  selectable = true;
  removable = true;
  separatorKeysCodes: number[] = [ENTER, COMMA];
  fruitCtrl = new FormControl();
  filteredFruits: Observable<string[]>;
  fruits: string[] = ['Lemon'];
  allFruits: string[] = ['Bugs', 'ventas', 'problema registro', 'pedido incompleto/malo', 'No llego a tiempo'];
  messageSubscription:any;
  commentsSubscription:any;
  @ViewChild('fruitInput') fruitInput: ElementRef<HTMLInputElement>;
  @ViewChild('auto') matAutocomplete: MatAutocomplete;

  constructor(
    private fetchData: FecthDataService,
    private setData: SetDataService,
    private holdData: HoldDataService,
    // UI components
    public dialog: MatDialog,
    private _ngZone: NgZone,
    private router: Router,
  ) { 
    //getting params from navigation

    this.filteredFruits = this.fruitCtrl.valueChanges.pipe(
      startWith(null),
      map((fruit: string | null) => fruit ? this._filter(fruit) : this.allFruits.slice()));
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
}

ngOnDestroy(){
  this.destroy$.next();
  this.destroy$.complete();
  this.messageSubscription.unsubscribe();
  this.commentsSubscription.unsubscribe();
}

createChat(){
  this.router.navigate(['directorio']);
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

getWhatsappTemplateMessages() {
  // get whatsapp approve templates
  this.fetchData.getWhatsappTemplates()
    .subscribe(data =>{
      let obj = data.data();
      Object.keys(obj).forEach(k => {
        this.templatesArray.push(obj[k]);
      })
    })
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
    number: data.number
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
    this.messageSubscription = this.fetchData.getMessagesFromSpecificWChat(
      this.companyId, 
      data.number
    )
    .subscribe((data) => {
      data.map(d => {
        if (this.firstTimeMsgLoad === true) {
          this.chatMessages.unshift({...d.payload.doc.data()});
        } else{
          this.chatMessages.push({...d.payload.doc.data()});
        }
      })
      this.firstTimeMsgLoad = false;
    })
  })
  .catch(error => {
    console.error(error);
  })
}

sendMessage(){
  // check if chat is active
  this.fetchData.checkWhatsapp24HourWindow({
    companyId: this.companyId,
    number: this.currentChatData.phoneNumber
  }).toPromise()
  .then(async(dataSession) => {
    if(dataSession === 'false') {
      this.templatesActivated = true;
      this.templatesActivatedOptions = true;
    } 
    this.showSpinner = true;
    //send message in specific room
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
        mediaUrl: mediaUrl
      }).toPromise()
      .then(async (data) => {        
        const timestamp = this.holdData.convertJSDateIntoFirestoreTimestamp();
        let dataFirebase;
        if (mediaUrl) {
          dataFirebase = {
            inbound: false,
            message: this.currentMessage,
            timestamp: timestamp,
            mediaUrl: mediaUrl
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
        if(error.error = 'saldo insuficiente') {
          alert('No se puede enviar mensaje porque la empresa no tiene saldo suficiente');
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
  }


  add(event: MatChipInputEvent): void {
    const input = event.input;
    const value = event.value;

    // Add our fruit
    if ((value || '').trim()) {
      this.fruits.push(value.trim());
    }

    // Reset the input value
    if (input) {
      input.value = '';
    }

    this.fruitCtrl.setValue(null);
  }

  remove(fruit: string): void {
    const index = this.fruits.indexOf(fruit);

    if (index >= 0) {
      this.fruits.splice(index, 1);
    }
  }

  selected(event: MatAutocompleteSelectedEvent): void {
    this.fruits.push(event.option.viewValue);
    this.fruitInput.nativeElement.value = '';
    this.fruitCtrl.setValue(null);
  }

  private _filter(value: string): string[] {
    const filterValue = value.toLowerCase();

    return this.allFruits.filter(fruit => fruit.toLowerCase().indexOf(filterValue) === 0);
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

  archiveChat(){
    // finish chat and remove agent from chat
    this.setData.archiveChat({
      companyId: this.companyId,
      number: this.currentChatData.phoneNumber
    })
  }
}

