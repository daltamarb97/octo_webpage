import { Component, OnInit, ViewChild } from '@angular/core';
import { 
  MatDialog, 
  MatSnackBarHorizontalPosition, 
  MatSnackBarVerticalPosition, 
  //MatSnackBar,
  MatTabGroup,
  MatSnackBar
} from '@angular/material';
import { formatDate } from '@angular/common';

import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

// services
import { FecthDataService } from '../../core/services/fecth-data.service';
import { SetDataService } from '../../core/services/set-data.service';
import { DeleteDataService } from '../../core/services/delete-data.service';
import { HoldDataService } from '../../core/services/hold-data.service';

// dialog material
import { Router, ActivatedRoute } from '@angular/router';
import { BoardDialogComponent } from '../../material-component/board-dialog/board-dialog.component';


@Component({
  selector: 'app-board',
  templateUrl: './board.component.html',
  styleUrls: ['./board.component.scss']
})
export class BoardComponent implements OnInit {
  @ViewChild(MatTabGroup) tabGroup: MatTabGroup;

  destroy$:  Subject<void> = new Subject();

  userId:string;
  companyInfo: any;
  taskList: Array<any> = []; // array of tasks used in the html
  taskListPersonal: Array<any> = []; // array of personal tasks used in the html 
  employeesList: Array<any> = []; // array of personal tasks used in the html 
  backColor:string; // color of header background
  listOfBacgroundColors: Array<string> = ['#ADD8E6', '#F5B6C1', '#DDBDF1', '#90EE90'];
  body:string;
  title:string;
  taskLink:any;
  personalTaskLink:any;
  showTask:boolean = false;
  currentTask:any;
  fileId:any;
  // snack bar variables
  horizontalPosition: MatSnackBarHorizontalPosition = 'center';
  verticalPosition: MatSnackBarVerticalPosition = 'bottom';
  constructor(
    public dialog: MatDialog,
    private _snackBar: MatSnackBar,
    // services
    private fetchData: FecthDataService,
    private setData: SetDataService,
    private deleteData: DeleteDataService,
    private holdData: HoldDataService,
    private router: Router,
    private route: ActivatedRoute,
  ) { 
    //getting tasks from home link 
    this.route.queryParams.subscribe(() => {
      if (this.router.getCurrentNavigation().extras.state) {
        this.taskLink = this.router.getCurrentNavigation().extras.state.task;
        console.log(this.taskLink);

        this.viewTaskBody(this.taskLink.info,this.taskLink.index)    
      }
    });

    //getting personal tasks from home link 
    this.route.queryParams.subscribe(() => {
      if (this.router.getCurrentNavigation().extras.state) {
        this.personalTaskLink = this.router.getCurrentNavigation().extras.state.personalTask;
        console.log(this.personalTaskLink.info);
        this.viewTaskBody(this.personalTaskLink.info,this.personalTaskLink.index)
      }
    });
  }

  ngOnInit(): void {
    this.userId = this.holdData.userId;
    this.companyInfo = this.holdData.companyInfo;
    this.getTasks();
    this.getEmployees();
  }



  private getTasks(){
    // get tasks of company
    this.taskList = [];
    this.fetchData.getCompanyTasks(this.holdData.userInfo.companyId)
    .pipe(
      takeUntil(this.destroy$)
    )
    .subscribe((tasks)=>{
      tasks.map(a => {
        const announcement = a.payload.doc.data();
        this.taskList.push(announcement);
        console.log(this.holdData.userId);
        if (announcement.assignedTo === this.holdData.userId) {
          this.taskListPersonal.push(announcement);
        }
      })
    });
  }

  private getEmployees () {
    // get employees to assign tasks
    this.fetchData.getCompanyEmployees(this.holdData.userInfo.companyId)
      .subscribe(empl => {
        empl.map(e => {
          const employee = e.payload.doc.data();
          this.employeesList.push(employee);
        })
      })
  }


  createTask(){
    // REFACTOR EVERYTHING
    const dialogRef = this.dialog.open(BoardDialogComponent);

    dialogRef.afterClosed()
    .subscribe(result =>{
      console.log(result.data);
      
      if (result.event != 'close') {
        const rta = result.data;
        if (rta.file) {
          const resultData = {
            title: rta.title,
            details: rta.details,
            timestamp: this.holdData.convertJSCustomDateIntoFirestoreTimestamp(rta.date),
            assignedTo: rta.assigned,
            file: true,
            fileInfo: rta.file,
            assignedBy: this.userId,
          };
          this.createTaskFirebase(resultData);
        } else {
          const resultData = {
            title: rta.title,
            details: rta.details,
            timestamp: this.holdData.convertJSCustomDateIntoFirestoreTimestamp(rta.date),
            assignedTo: rta.assigned,
            file: false,
            assignedBy: this.userId,
          };
          this.createTaskFirebase(resultData);
        }
      } 
    })  
  }
  

  viewTaskBody(item, i){
    if (item.fileId) {
      const data = {
        companyId: this.holdData.companyInfo.companyId,
        taskId: item.taskId,
        fileId: item.fileId,
      }
      this.getFile(data);
    }
    this.showTask = true;
    this.currentTask = {
      ...item,
      timestamp: formatDate(item.timestamp.toDate(), 'yyyy-MM-dd', 'en-US') ,
    }
  }


  private getFile(data) {
    // get file for specific task
    this.fetchData.getFileFromTask(data)
    .then(url => {
      this.fileId = url;
    })
  }



  // private updateAnnouncement(item, data){
  //   // edition of announcement
  //   this.setData.updateTask(this.holdData.userInfo.companyId, item.announcementId, data);
  // }


  // private deleteAnnouncement(item){
  //   // elimination of announcement
  //   this.deleteData.deleteTask(this.holdData.userInfo.companyId, item.announcementId);
  // }


  private createTaskFirebase(data){
    // creation of new task
    this.setData.createTask(this.holdData.userInfo.companyId, data)
    .then(()=>{
        this._snackBar.open('Tarea creada con exito', 'Cerrar', {
          duration: 3000,
          horizontalPosition: this.horizontalPosition,
          verticalPosition: this.verticalPosition,
        });
    })
  }
}
