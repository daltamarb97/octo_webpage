import { Component, OnInit } from '@angular/core';
import {
  MatTableDataSource, 
  MatSnackBarHorizontalPosition,
  MatSnackBarVerticalPosition,
} from '@angular/material';
import { Router, NavigationExtras } from '@angular/router';

import { FecthDataService } from '../core/services/fecth-data.service';
import { takeUntil } from 'rxjs/operators';
import { Subject } from 'rxjs';

import { HoldDataService } from '../core/services/hold-data.service';

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
    selector: 'app-dashboard',
    templateUrl: './dashboard.component.html',
    styleUrls: ['./dashboard.component.scss']
})

export class DashboardComponent implements OnInit {
     
    destroy$: Subject<void> = new Subject();
    file:any;
    arrayBuffer:any;
    filelist = [];
    companyId: string;
    // snackbar variables
    horizontalPosition: MatSnackBarHorizontalPosition = 'center';
    verticalPosition: MatSnackBarVerticalPosition = 'bottom';

    taskList: Array<any> = []; // array of tasks used in the html
    taskListPersonal: Array<any> = []; // array of personal tasks used in the html 
    // chat variables
    userId:string;
    chatRooms:Array<any> = [];  // list of names of rooms
    privateChats:Array<any> = [];  // private chats messages
    privateChatsNames:Array<any> = []; // list of names of private chats
    currentPrivateChat:currentPrivateChatData;
    currentMessage:string; // message to be send
    currentRoomData: currentRoomData;  // information of selected room chat
    currentRoomParticipants: Array<any> = []; // information of current room participants
    residentsData:Array<any> = []; // residents list
    employeesData:Array<any> = []; // employees list
    showDetail: boolean = true;
    showPrivateChats:boolean=false;
    showRoomChats:boolean=false;
    constructor(
      // services
      private fetchData: FecthDataService,
      private holdData: HoldDataService,
      // angular components
      private router: Router,
    ){ }

  ngOnInit(): void {
      this.userId = this.holdData.userId;
      this.companyId = this.holdData.userInfo.companyId;
      this.getChatRoomNames();
      this.getPrivateMessages();
      this.getTasks(); 
  }

  /*******************
  CHAT ROOMS
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
          console.log(data);
        }else if( a.type === 'removed'){
          for(let i in this.chatRooms){
            if(this.chatRooms[i].roomId === this.currentRoomData.roomId){
              const index = parseInt(i);
              this.chatRooms.splice(index, 1);
            }
          }
        }
      });  
    })
  }


  goToChat(room,i){
    let chat ={roomId:room.roomId,index:i};
    let navigationExtras: NavigationExtras = {
      state: {
        room: chat
      }
    };
    this.router.navigate(['canales-comunicacion'], navigationExtras);
  }

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
    })
  }


  goToPrivateChat(privateChat,i){
    let chat ={chatId:privateChat.chatId,index:i};
    let navigationExtras: NavigationExtras = {
      state: {
        privateChat: chat
      }
    };
    this.router.navigate(['canales-comunicacion'], navigationExtras);
  }


  /*******************
        TASKS
  *******************/
  private getTasks(){
    // get announcements of building
    this.taskList = [];
    this.fetchData.getCompanyTasks(this.holdData.userInfo.companyId)
    .pipe(
      takeUntil(this.destroy$)
    )
    .subscribe((tasks)=>{
      tasks.map(res => {
        const task = res.payload.doc.data();
        if (res.payload.type === 'added') {
          if(task.finished !== true) {
            const taskToPush = {
              ...task,
              timestamp: task.timestamp.toDate()
            };
            (task.assignedTo === this.holdData.userInfo.email) 
              ? this.taskListPersonal.push(taskToPush) 
              : console.log('');
            this.taskList.push(taskToPush);
          }
        } else if (res.payload.type === 'modified') {
          const data = res.payload.doc.data();
          const taskToPush = {
            ...data,
            timestamp: task.timestamp.toDate()
          };
          const taskId = res.payload.doc.id;
          for (let i = 0; i<this.taskList.length; i++) {
            if (this.taskList[i].taskId === taskId) {
              this.taskList.splice(i, 1)
              this.taskList.push(taskToPush)
            }
          } 
          for (let i = 0; i<this.taskListPersonal.length; i++) {
            if (this.taskListPersonal[i].taskId === taskId) {
              this.taskListPersonal.splice(i, 1)
              this.taskListPersonal.push(taskToPush)
            }
          } 
        } else if (res.payload.type === 'removed') {
          const taskId = res.payload.doc.id;
          for (let i = 0; i<this.taskList.length; i++) {
            if (this.taskList[i].taskId === taskId) return this.taskList.splice(i, 1)
          } 
          for (let i = 0; i<this.taskListPersonal.length; i++) {
            if (this.taskListPersonal[i].taskId === taskId) return this.taskListPersonal.splice(i, 1) 
          }
        }
      })
    });
  }

  goToTask(item,i){
    let task ={index:i,info:item};

    let navigationExtras: NavigationExtras = {
      state: {
        task: task
      }
    };
    this.router.navigate(['pizarra'], navigationExtras);
  }

  
  goToPersonalTask(item,i){
    let personalTask ={index:i,info:item}; 
    console.log(personalTask);
    
    let navigationExtras: NavigationExtras = {
      state: {
        personalTask: personalTask
      }
    };
    this.router.navigate(['pizarra'], navigationExtras);
  }


    ngOnDestroy(){
      this.destroy$.next();
      this.destroy$.complete();
      console.log('me destrui');
    }
}

