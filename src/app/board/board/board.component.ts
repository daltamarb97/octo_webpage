import { Component, OnInit } from '@angular/core';
import { MatDialog, MatSnackBar } from '@angular/material';

import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

// services
import { FecthDataService } from '../../core/services/fecth-data.service';
import { SetDataService } from '../../core/services/set-data.service';
import { DeleteDataService } from '../../core/services/delete-data.service';
import { HoldDataService } from '../../core/services/hold-data.service';


// dialog material
import { BoardDialogComponent } from '../../material-component/board-dialog/board-dialog.component';





@Component({
  selector: 'app-board',
  templateUrl: './board.component.html',
  styleUrls: ['./board.component.scss']
})
export class BoardComponent implements OnInit {
  destroy$:  Subject<void> = new Subject();

  userId:string;
  buildingInfo: any;
  announcementList: Array<any> = []; // array of announcements used in the html
  backColor:string; // color of header background
  listOfBacgroundColors: Array<string> = ['#ADD8E6', '#F5B6C1', '#DDBDF1', '#90EE90'];
  body:string;
  title:string;
  constructor(
    public dialog: MatDialog,
    // services
    private fetchData: FecthDataService,
    private setData: SetDataService,
    private deleteData: DeleteDataService,
    private holdData: HoldDataService,
    private _snackBar: MatSnackBar,
  ) { }

  ngOnInit(): void {
    this.userId = this.holdData.userId;
    this.buildingInfo = this.holdData.buildingInfo;
    this.getAnnouncements();
  }


  ngOnDestroy(){
    this.destroy$.next();
    this.destroy$.complete();
  }


  private getAnnouncements(){
    // get announcements of building
    this.announcementList = [];
    this.fetchData.getBoardAnnouncements(this.holdData.userInfo.buildingId)
    .pipe(
      takeUntil(this.destroy$)
    )
    .subscribe((announcements)=>{
      this.announcementList = announcements;
      this.colorBackgroundChange();
    });
  }


  private colorBackgroundChange(){
    // change the color of the background of cards headers 
    this.announcementList.forEach((el)=>{
      const indexOfColor = Math.floor(Math.random()*this.listOfBacgroundColors.length);
      el.colorHeader = this.listOfBacgroundColors[indexOfColor];
    });
  }


  createAnnouncement(){
    console.log(this.title);
    console.log(this.body);
    const resultData = {
      title: this.title,
      body: this.body,
      timestamp: this.holdData.convertJSDateIntoFirestoreTimestamp()
        };
      
     // creation of new announcement
     this.setData.createAnnouncement(this.holdData.userInfo.activeBuilding, resultData)
     .then(()=>{
      // let snackBarRef = snackBar.open('Message archived');

     })
  }
  

  viewAnnouncementBody(item, i){
    item.action = 'view';
    const dialogRef = this.dialog.open(BoardDialogComponent,{
      data: item
    });

    dialogRef.afterClosed().subscribe(result => {
      const event = result.event;
      if(event === 'edit'){
        const resultData = {
          announcementId: item.announcementId,
          title: result.data.title,
          body: result.data.body,
          timestamp: result.data.timestamp
        };
        this.updateAnnouncement(item, resultData);
      }else if(event === 'delete'){
        this.deleteAnnouncement(item);
      }else{}
    })
  }


  private updateAnnouncement(item, data){
    // edition of announcement
    this.setData.updateAnnouncement(this.holdData.userInfo.buildingId, item.announcementId, data);
  }


  private deleteAnnouncement(item){
    // elimination of announcement
    this.deleteData.deleteAnnouncement(this.holdData.userInfo.buildingId, item.announcementId);
  }


  // private createAnnouncement(data){
  //   // creation of new announcement
  //   this.setData.createAnnouncement(this.holdData.userInfo.buildingId, data);
  // }
}
