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
}

// export class currentPrivateChatData {
//   name:string;
//   chatId:string;
//   lastname:string;
// }

@Component({
  selector: 'app-whatsapp',
  templateUrl: './whatsapp.component.html',
  styleUrls: ['./whatsapp.component.scss']
})
export class WhatsappComponent implements OnInit {
  @ViewChild('autosize') autosize: CdkTextareaAutosize;

  destroy$: Subject<void> = new Subject();

  userId:string;
  companyId:string;
  chatWhatsapp:Array<any> = [];  // list of names of rooms
  chatWhatsappAssigned:Array<any> = [];  // list of names of rooms
  chatMessages: Array<any> = []; // array of messages of specific room
  currentMessage:string; // message to be send
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
  selectOption: any;
  // privateChat:any;
  // newChat:any;
  // oldChat:any;
  firstTimeMsgLoad: boolean = false;
  // firstTimePrivateMsgLoad: boolean = false;
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

  @ViewChild('fruitInput') fruitInput: ElementRef<HTMLInputElement>;
  @ViewChild('auto') matAutocomplete: MatAutocomplete;

  constructor(
    private fetchData: FecthDataService,
    private setData: SetDataService,
    private holdData: HoldDataService,
    private deleteData: DeleteDataService,
    // UI components
    public dialog: MatDialog,
    private _ngZone: NgZone,
    private router: Router,
    private route: ActivatedRoute,
  ) { 
    //getting params from navigation
    this.route.queryParams.subscribe(() => {
      if (this.router.getCurrentNavigation().extras.state) {
        const currentNav = this.router.getCurrentNavigation().extras.state
        if (currentNav.room) {
          this.chat = currentNav.room;
        } else if (currentNav.privateChat) {
          // this.privateChat = currentNav.privateChat;
        } else if (currentNav.dirChat) {
          // this.getMessagesFromPrivateChatOnclick(currentNav.dirChat);
        }
      }
    });

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
    // info comes from home
    if(this.chat){
      this.getMessagesFromWChat(this.chatWhatsapp[this.chat.index]); 
      this.chat = null;
      this.showGeneralChats=true;
      this.showAssignedChats=false;   
      }  
  });
}

getMessagesFromWChat(data){
  this.currentChatData = {
    phoneNumber: data.number,
    assignedTo: (data.assignedTo) ? data.assignedTo : 'null'
  }
  this.showGeneralChats=true;
  this.showAssignedChats=false;
  this.chatMessages = []; //clear the array on click
  // this.privateChats = []; //clear the array on click
  this.getMessagesFirebase(data);
}


async getMessagesFromChatOnclick(data) {
  this.fetchData.checkWhatsapp24HourWindow({
    companyId: this.companyId,
    number: data.number
  }).toPromise()
  .then(dataSession => {
    if(dataSession === 'false') {
      this.templatesActivated = true;
    } 
    this.firstTimeMsgLoad = true;
    this.chatMessages = [];
    this.currentChatData = {
      phoneNumber: data.number,
      assignedTo: (data.assignedTo) ? data.assignedTo : 'null'
    }
    this.showGeneralChats=true;
    this.showAssignedChats=false;
    this.fetchData.getMessagesFromSpecificWChat(
      this.companyId, 
      data.number
    ).subscribe((data) => {
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
}

getMessagesFromChatOnclickAssigned(data) {
  this.fetchData.checkWhatsapp24HourWindow({
    companyId: this.companyId,
    number: data.number
  }).toPromise()
  .then(dataSession => {
    if(dataSession === 'false') {
      this.templatesActivated = true;
    } 
    this.firstTimeMsgLoad = true;
    this.chatMessages = [];
    this.currentChatData = {
      phoneNumber: data.number,
      assignedTo: (data.assignedTo) ? data.assignedTo : 'null'
    }
    this.showAssignedChats=true;
    this.showGeneralChats=false;
    this.fetchData.getMessagesFromSpecificWChat(
      this.companyId, 
      data.number
    ).subscribe((data) => {
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
}

private getMessagesFirebase(data) {
    // get messages from room in firestore
    this.fetchData.getMessagesFromSpecificWChat(
    this.companyId, 
    data.number,
  )
  .pipe(
    takeUntil(this.destroy$)
  )
  .subscribe(res => { 
    res.map(r => {
      const msg = r.payload.doc.data();
      this.chatMessages.push(msg);
    })
  })
}

sendMessage(){
    //send message in specific room
    if(this.currentMessage !== undefined && this.currentMessage !== null && this.currentMessage.trim().length !== 0) {
      const timestamp = this.holdData.convertJSDateIntoFirestoreTimestamp();
      const messageData = {
        inbound: false,
        message: this.currentMessage,
        timestamp: timestamp,
      }
    
      this.setData.sendWhatsappMessage(this.companyId, this.currentChatData.phoneNumber, messageData);
      // uncomment in production
      // this.setData.sendWhatsappMessageHttp({
      //   message: this.currentMessage,
      //   number: this.currentChatData.phoneNumber
      // }).subscribe(data => console.log(data))
      this.currentMessage = null;
      var objDiv = document.getElementById("content-messages");
      objDiv.scrollTop = objDiv.scrollHeight; 
    } else {
      this.currentMessage = null;
    }
}


showDetails(){
  // if (this.showDetail) {
  //   this.showDetail = false
  // } else {
  //   this.showDetail = true
  // }
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
}

