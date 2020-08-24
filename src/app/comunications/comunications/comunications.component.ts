import { Component, OnInit, ViewChild, NgZone, ChangeDetectionStrategy } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';

import { FecthDataService } from '../../core/services/fecth-data.service';
import { SetDataService } from '../../core/services/set-data.service';
import { DeleteDataService } from '../../core/services/delete-data.service';

import { ChatCreationDialogComponent } from '../../material-component/chat-creation-dialog/chat-creation-dialog.component';

import { takeUntil, take } from 'rxjs/operators';
import { Subject } from 'rxjs';
import { HoldDataService } from '../../core/services/hold-data.service';
import { CdkTextareaAutosize } from '@angular/cdk/text-field';
import { Router, ActivatedRoute } from '@angular/router';

export class currentRoomData {
  name:string;
  roomId:string;
  description:string;
}

export class currentPrivateChatData {
  name:string;
  chatId:string;
  lastname:string;
}

@Component({
  selector: 'app-comunications',
  templateUrl: './comunications.component.html',
  styleUrls: ['./comunications.component.scss']
})
export class ComunicationsComponent implements OnInit {
  @ViewChild('autosize') autosize: CdkTextareaAutosize;

  destroy$: Subject<void> = new Subject();

  userId:string;
  companyId:string;
  chatRooms:Array<any> = [];  // list of names of rooms
  privateChats:Array<any> = [];  // private chats messages
  privateChatsNames:Array<any> = []; // list of names of private chats
  currentPrivateChat:currentPrivateChatData;
  chatMessages: Array<any> = []; // array of messages of specific room
  currentMessage:string; // message to be send
  currentRoomData: currentRoomData;  // information of selected room chat
  currentRoomParticipants: Array<any> = []; // information of current room participants
  residentsData:Array<any> = []; // residents list
  employeesData:Array<any> = []; // employees list
  showDetail: boolean = false;
  showPrivateChats:boolean=false;
  showRoomChats:boolean=false;
  chat:any;
  privateChat:any;
  newChat:any;
  oldChat:any;
  firstTimeMsgLoad: boolean = false;
  firstTimePrivateMsgLoad: boolean = false;
  // showSearchBar:boolean = false;

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
          this.getMessagesFromPrivateChatOnclick(currentNav.dirChat);
        }
      }
    });
  }

ngOnInit(): void {
  this.userId = this.holdData.userId;
  this.companyId = this.holdData.userInfo.companyId;
  this.getChatRoomNames();
  this.getPrivateMessages();
}

ngOnDestroy(){
  this.destroy$.next();
  this.destroy$.complete();
}

createChat(){
  this.router.navigate(['directorio']);
}

/*******************
ROOM CHAT
*******************/
getChatRoomNames(){
  // get chat rooms names
  this.fetchData.getChatRooms(this.userId)
  .pipe(
    takeUntil(this.destroy$)
  )
  .subscribe(data => {
    data.map(a=>{
      if(a.type === 'added'){
        const data= a.payload.doc.data();
        this.chatRooms.push(data);
      }else if( a.type === 'removed'){
        for(let i in this.chatRooms){
          if(this.chatRooms[i].roomId === this.currentRoomData.roomId){
            const index = parseInt(i);
            this.chatRooms.splice(index, 1);
          }
        }
      }
    }); 
    // info comes from home
    if(this.chat){
      this.getMessagesFromRoom(this.chatRooms[this.chat.index]); 
      this.chat = null;
      this.showRoomChats=true;
      this.showPrivateChats=false;   
      }  
  });
}

getMessagesFromRoom(data){
  this.currentRoomData = {
    name: data.roomName,
    roomId: data.roomId,
    description: data.roomDescription,
  }
  this.showRoomChats=true;
  this.showPrivateChats=false;
  this.chatMessages = []; //clear the array on click
  this.privateChats = []; //clear the array on click
  this.getMessagesFirebase(data);
  this.getParticipantsFromRoom();
}


getMessagesFromRoomOnclick(data) {
  this.firstTimeMsgLoad = true;
  this.chatMessages = [];
  this.currentRoomData = {
    name: data.roomName,
    roomId: data.roomId,
    description: data.roomDescription,
  }
  this.showRoomChats=true;
  this.showPrivateChats=false;
  this.fetchData.getMessagesFromSpecificRoomOnView(
    this.companyId, 
    data.roomId
  ).subscribe((data) => {
    data.map(d => {
      if (this.firstTimeMsgLoad === true) {
        this.chatMessages.unshift({...d.payload.doc.data(), timestamp: d.payload.doc.data().timestamp.toDate()});
      } else{
        this.chatMessages.push({...d.payload.doc.data(), timestamp: d.payload.doc.data().timestamp.toDate()});
      }
    })
    this.firstTimeMsgLoad = false;
  })
  
}

moreMessages(){
  this.getMessagesFirebase(this.currentRoomData)
}

private getMessagesFirebase(data) {
    // get messages from room in firestore
    let timestamp;
    const limit = 20;
    if (this.chatMessages.length !== 0) {
      timestamp = this.chatMessages[0].timestamp;
    } else {
      timestamp = new Date;
    }
    this.fetchData.getMessagesFromSpecificRoom(
    this.companyId, 
    data.roomId,
    timestamp,
    limit
  )
  .pipe(
    takeUntil(this.destroy$)
  )
  .subscribe(res => { 
    if (this.chatMessages.length !== 0) {
      const holdMessages = [];
      holdMessages.push(...this.chatMessages);
      this.chatMessages = [];
      res.forEach(msg => {
        const response = msg.data();
        const singleMessage = {
          ...response,
          timestamp: response.timestamp.toDate(),
        }
        this.chatMessages.unshift(singleMessage);
      });
      this.chatMessages.push(...holdMessages);
    }else {
      res.forEach(msg => {
        const response = msg.data();
        const singleMessage = {
          ...response,
          timestamp: response.timestamp.toDate(),
        }
        this.chatMessages.unshift(singleMessage);
      });
    } 
  })
}

private getParticipantsFromRoom(){
  this.currentRoomParticipants = []; //clear the array on click
  // get participants of current room
  this.fetchData.getParticipantsFromSpecificRoom(
    this.companyId, 
    this.currentRoomData.roomId
  )
  .pipe(
    takeUntil(this.destroy$)
  )
  .subscribe(participants => {
    participants.map(p=>{
      const participant = p.payload.doc.data(); 
      this.currentRoomParticipants.push(participant)
    })
  })
}

addChatRoom(){
  const dialogRef = this.dialog.open(ChatCreationDialogComponent, {data: this.companyId});
  dialogRef.afterClosed()
  .subscribe(result =>{
    // create new chat room  
    const roomData = {
      roomName: result.data.name,
      roomDescription: result.data.description
    }
    const participants: Array<any> = result.data.participants;
    this.setData.createChatRoom(
      this.companyId, 
      roomData, 
      this.userId,
      participants
    );  
  })  
}

sendMessage(){
  // send message in specific room
  if(this.currentMessage && this.currentMessage.length !== 0) {
    const timestamp = this.holdData.convertJSDateIntoFirestoreTimestamp();
    const messageData = {
      name: this.holdData.userInfo.name,
      lastname: this.holdData.userInfo.lastname,
      message: this.currentMessage,
      timestamp: timestamp,
      userId: this.userId
    }
  
    const tempData = {
      name: this.holdData.userInfo.name,
      lastname: this.holdData.userInfo.lastname,
      message: this.currentMessage,
      timestamp: new Date,
      userId: this.userId
    }
    this.chatMessages.push(tempData);
    this.setData.sendChatMessage(this.companyId, this.currentRoomData.roomId, messageData);
    this.currentMessage = '';
    var objDiv = document.getElementById("content-messages");
    objDiv.scrollTop = objDiv.scrollHeight; 
  }
}

deleteChatRoom(){
  // delete current chat room
  const dialogRef = this.dialog.open(ChatCreationDialogComponent,{data: 'delete'});
  dialogRef.afterClosed()
  .subscribe(result => {
    if(result.data === 'delete'){
      this.deleteData.deleteChatRoom(this.companyId, this.currentRoomData.roomId, this.userId);
    }else{
      // do nothing
    }
  })
}

showDetails(){
  if (this.showDetail) {
    this.showDetail = false
  } else {
    this.showDetail = true
  }
}

/*******************
END OF ROOM CHAT
*******************/


/*******************
PRIVATE CHAT
*******************/
 
getPrivateMessages(){
  // get names from private messages 
  this.fetchData.getPrivateChats(this.userId)
  .subscribe(data => {
    data.map(a=>{
      if(a.type === 'added'){
        const data= a.payload.doc.data(); 
        this.privateChatsNames.push(data);
      }else if( a.type === 'removed'){
        for(let i in this.privateChatsNames){
          if(this.privateChatsNames[i].chatId === this.currentRoomData.roomId){
            const index = parseInt(i);
            this.privateChatsNames.splice(index, 1);
          }
        }
      }
    });
    //check if its a link from Home
    if(this.privateChat){
      this.getMessagesFromPrivateChat(this.privateChatsNames[this.privateChat.index]); 
      this.showRoomChats=false;
      this.showPrivateChats=true;
      this.privateChat = undefined;
    }
  })
}

getMessagesFromPrivateChat(data){
  this.currentPrivateChat = {
    name: data.name,
    chatId: data.chatId,
    lastname: data.lastname,
  }
  this.showRoomChats=false;
  this.showPrivateChats=true;
  this.chatMessages = []; //clear the array on click
  this.privateChats = []; //clear the array on click
  // get messages from room in firestore
  this.getPrivateMessagesFirebase(data);
}


getMessagesFromPrivateChatOnclick(data) {
  this.firstTimePrivateMsgLoad = true;
  this.privateChats = [];
  this.currentPrivateChat = {
    name: data.name,
    chatId: data.chatId,
    lastname: data.lastname,
  }
  this.showRoomChats=false;
  this.showPrivateChats=true;
  this.fetchData.getMessagesFromSpecificRoomPrivateOnView(
    data.chatId
  ).subscribe((data) => {
    data.map(d => {
      if (this.firstTimePrivateMsgLoad === true) {
        this.privateChats.unshift({...d.payload.doc.data(), timestamp: d.payload.doc.data().timestamp.toDate()});
      } else{
        this.privateChats.push({...d.payload.doc.data(), timestamp: d.payload.doc.data().timestamp.toDate()});
      }
    })
    this.firstTimePrivateMsgLoad = false;
  })
}

private getPrivateMessagesFirebase(data) {
  // get messages from room in firestore
  let timestamp;
  const limit = 20;
  if (this.privateChats.length !== 0) {
    timestamp = this.privateChats[0].timestamp;
  } else {
    timestamp = new Date;
  }
  this.fetchData.getSpecificChat(
    data.chatId,
    timestamp,
    limit
  )
  .pipe(
    takeUntil(this.destroy$)
  )
  .subscribe(res => {  
    this.showPrivateChats=true;

    if (this.privateChats.length !== 0) {
      const holdMessages = [];
      holdMessages.push(...this.privateChats);
      this.privateChats = [];
      res.forEach(msg => {
        const response = msg.data();
        const singleMessage = {
          ...response,
          timestamp: response.timestamp.toDate(),
        }
        this.privateChats.unshift(singleMessage);
      });
      this.privateChats.push(...holdMessages);

    }else {
      res.forEach(msg => {
        const response = msg.data();
        const singleMessage = {
          ...response,
          timestamp: response.timestamp.toDate(),
        }
        this.privateChats.unshift(singleMessage);

      });
    } 
  })
}

morePrivateMessages(){
  this.getPrivateMessagesFirebase(this.currentPrivateChat) 
}

sendPrivateMessage(){
  if (this.currentMessage && this.currentMessage.length !== 0) {
    // send message in private chat
    const privateMessageData = {
      name: this.holdData.userInfo.name,
      lastname: this.holdData.userInfo.lastname,
      message: this.currentMessage,
      timestamp: this.holdData.convertJSDateIntoFirestoreTimestamp(),
      userId: this.userId
    }
  
    const tempPrivateMessage = {
      name: this.holdData.userInfo.name,
      lastname: this.holdData.userInfo.lastname,
      message: this.currentMessage,
      timestamp: new Date,
      userId: this.userId
    }
  
    this.privateChats.push(tempPrivateMessage);
    this.setData.sendPrivateChatMessage(this.currentPrivateChat.chatId, privateMessageData);
    this.currentMessage = '';
    var objDivPriv = document.getElementById("content-messages-private");
    objDivPriv.scrollTop = objDivPriv.scrollHeight; 
  }
}
/*******************
END OF PRIVATE CHAT
*******************/
 
  // ------------------------------------
  triggerResize() {
    // Wait for changes to be applied, then trigger textarea resize.
    this._ngZone.onStable.pipe(take(1))
        .subscribe(() => this.autosize.resizeToFitContent(true));
  }
  

}
