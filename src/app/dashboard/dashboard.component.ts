import { Component, OnInit } from '@angular/core';
import {
  MatTableDataSource, 
  MatDialog, 
  MatSnackBarHorizontalPosition,
  MatSnackBarVerticalPosition,
  MatSnackBar
} from '@angular/material';
import { Router, NavigationExtras } from '@angular/router';

import { FecthDataService } from '../core/services/fecth-data.service';
import { SetDataService } from '../core/services/set-data.service';

import { takeUntil } from 'rxjs/operators';
import { Subject } from 'rxjs';

import * as XLSX from 'xlsx';

import { DialogOverviewComponent } from './../material-component/dialog/dialog.component'
import { DeleteDataService } from '../core/services/delete-data.service';
import { HoldDataService } from '../core/services/hold-data.service';
import { ExcelDialogComponent } from '../material-component/excel-dialog/excel-dialog.component';

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
      private setData: SetDataService,
      private deleteData: DeleteDataService,
      // private authService: AuthService,
      private holdData: HoldDataService,
      // UI components
      public dialog: MatDialog,
      private router: Router,
      private _snackBar: MatSnackBar,
    ){
       
    }

    // table variables
    displayedColumns: string[] = [];
    dataSource = new MatTableDataSource([]);


       ngOnInit(): void {
    setTimeout(() => {
      console.log(this.holdData.userInfo.userId);
    console.log(this.holdData.userInfo.userId);

    this.userId = this.holdData.userId;
    console.log(this.holdData.userInfo.userId);
    
    this.companyId = this.holdData.userInfo.companyId;
    this.getChatRoomNames();
    this.getPrivateMessages();
    this.getTasks();

    }, 2000);
    
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
    console.log(chat);
    
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
    console.log(chat);
    console.log(privateChat);

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
    .subscribe((announcements)=>{
      announcements.map(a => {
        const announcement = a.payload.doc.data();
        //Push all tasks
        this.taskList.push(announcement);
        console.log(this.taskList);
        //Push only personal tasks
        if (announcement.assignedTo === this.holdData.userId) {
          this.taskListPersonal.push(announcement);
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

    // private router: Router,
    

    





     
}

