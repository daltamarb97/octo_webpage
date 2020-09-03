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
  chatMessages: Array<any> = []; // array of messages of specific room
  currentMessage:string; // message to be send
  currentChatData: currentChatData;  // information of selected room chat
  showDetail: boolean = false;
  showAssignedChats:boolean=false;
  showGeneralChats:boolean=false;
  WMessages: number;
  WSenders: number;
  chat:any;
  privateChat:any;
  newChat:any;
  oldChat:any;
  firstTimeMsgLoad: boolean = false;
  firstTimePrivateMsgLoad: boolean = false;
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
          this.privateChat = currentNav.privateChat;
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
  // this.getPrivateMessages();
}

ngOnDestroy(){
  this.destroy$.next();
  this.destroy$.complete();
}

createChat(){
  this.router.navigate(['directorio']);
}

getWhatsappQuota() {
  // get quota of whatsapp
  this.fetchData.getWhatsappQuota(this.companyId)
  .pipe(
    takeUntil(this.destroy$)
  )
  .subscribe(data => {
    console.log('active valuechanges');
    
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
    data.map(a=>{
      if(a.type === 'added'){
        const data= a.payload.doc.data();
        this.chatWhatsapp.push(data);
      }
    }); 
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
    phoneNumber: data.number
  }
  this.showGeneralChats=true;
  this.showAssignedChats=false;
  this.chatMessages = []; //clear the array on click
  this.privateChats = []; //clear the array on click
  this.getMessagesFirebase(data);
}


getMessagesFromChatOnclick(data) {
  this.firstTimeMsgLoad = true;
  this.chatMessages = [];
  this.currentChatData = {
    phoneNumber: data.number
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
  // send message in specific room
  // if(this.currentMessage && this.currentMessage.length !== 0) {
  //   const timestamp = this.holdData.convertJSDateIntoFirestoreTimestamp();
  //   const messageData = {
  //     name: this.holdData.userInfo.name,
  //     lastname: this.holdData.userInfo.lastname,
  //     message: this.currentMessage,
  //     timestamp: timestamp,
  //     userId: this.userId
  //   }
  
  //   const tempData = {
  //     name: this.holdData.userInfo.name,
  //     lastname: this.holdData.userInfo.lastname,
  //     message: this.currentMessage,
  //     timestamp: new Date,
  //     userId: this.userId
  //   }
  //   this.chatMessages.push(tempData);
  //   this.setData.sendChatMessage(this.companyId, this.currentRoomData.roomId, messageData);
  //   this.currentMessage = '';
  //   var objDiv = document.getElementById("content-messages");
  //   objDiv.scrollTop = objDiv.scrollHeight; 
  // }
}

deleteChatRoom(){
  // delete current chat room
  // const dialogRef = this.dialog.open(ChatCreationDialogComponent,{data: 'delete'});
  // dialogRef.afterClosed()
  // .subscribe(result => {
  //   if(result.data === 'delete'){
  //     this.deleteData.deleteChatRoom(this.companyId, this.currentRoomData.roomId, this.userId);
  //   }else{
  //     // do nothing
  //   }
  // })
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


/*******************
PRIVATE CHAT
*******************/

/*******************
END OF PRIVATE CHAT
*******************/
 
  // ------------------------------------
  triggerResize() {
    // Wait for changes to be applied, then trigger textarea resize.
    this._ngZone.onStable.pipe(take(1))
        .subscribe(() => this.autosize.resizeToFitContent(true));
  }
  assignToMe(){
    //this show do something
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
}

