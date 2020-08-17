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

  destroy$: Subject<void> = new Subject();

  userId:string;
  companyInfo: any;
  taskList: Array<any> = []; // array of tasks used in the html
  taskListPersonal: Array<any> = []; // array of personal tasks used in the html 
  employeesList: Array<any> = []; // array of personal tasks used in the html 
  taskLink:any;
  personalTaskLink:any;
  showTask:boolean = false;
  currentTask:any;
  fileData:any;
  editing: boolean = false;
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

  ngOnDestroy(){
    this.destroy$.next();
    this.destroy$.complete();
  }

  private getTasks(){
    // get tasks of company
    this.taskList = [];
    this.taskListPersonal = [];
    this.fetchData.getCompanyTasks(this.holdData.userInfo.companyId)
    .pipe(
      takeUntil(this.destroy$)
    )
    .subscribe((tasks)=>{
      this.taskList = [];
      this.taskListPersonal = [];
      tasks.map(t => {
        if(t.finished !== true) {
          const taskToPush = {
            ...t,
            timestamp: t.timestamp.toDate()
          };
          (t.assignedTo === this.holdData.userInfo.email) 
            ? this.taskListPersonal.push(taskToPush) 
            : console.log('');
          this.taskList.push(taskToPush);
        }
      })
    });
  }


  private getEmployees () {
    // get employees to assign tasks
    this.fetchData.getCompanyEmployees(this.holdData.userInfo.companyId)
      .subscribe(empl => {
        empl.map(e => {
          const employee = e.payload.doc.data().email;
          this.employeesList.push(employee);
        })
      })
  }


  createTask(){
    const dialogRef = this.dialog.open(BoardDialogComponent);

    dialogRef.afterClosed()
    .subscribe( async (result) =>{
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
            assignedBy: this.holdData.userInfo.email,
          };
          await this.createTaskFirebase(resultData);
        } else {
          const resultData = {
            title: rta.title,
            details: rta.details,
            timestamp: this.holdData.convertJSCustomDateIntoFirestoreTimestamp(rta.date),
            assignedTo: rta.assigned,
            file: false,
            assignedBy: this.holdData.userInfo.email,
          };
          await this.createTaskFirebase(resultData);
        }
      } 
      if (this.taskList.length === 0) {
        this.getTasks();
        this.tabGroup.selectedIndex = 1;
      }
    })  
  }
  

  async viewTaskBody(item, i){
    this.currentTask = null;
    this.fileData = null;
    if (item.fileId) {
      const data = {
        companyId: this.holdData.companyInfo.companyId,
        taskId: item.taskId,
        fileId: item.fileId,
      }
      await this.getFile(data);
    }
    this.currentTask = { ...item};
    this.showTask = true;
  }


  private getFile(data) {
    // get file for specific task
    return this.fetchData.getFileFromTask(data)
    .then(data => {
      this.fileData = data;
    })
  }


  downloadFile(url) {
    window.open(url, "_blank");
  }

  downloadImage(url) {
    window.open(url, "_blank");
  }


  private updateTask(data){
    // edition of task
    this.setData.updateTask(this.holdData.userInfo.companyId, data);
  }


  deleteTask(){
    // delete a task
    this.taskList = this.checkTaskInArray(this.taskList, this.currentTask.taskId);
    this.taskListPersonal = this.checkTaskInArray(this.taskListPersonal, this.currentTask.taskId);
    this.showTask = false;
    if (this.currentTask.fileId) {
      this.deleteData.deleteTask(this.holdData.userInfo.companyId, this.currentTask.taskId);
      this.deleteData.deleteFileOfTask(this.holdData.userInfo.companyId, this.currentTask.taskId, this.currentTask.fileId);
    } else {
      this.deleteData.deleteTask(this.holdData.userInfo.companyId, this.currentTask.taskId);
    } 
  }

  allowEdition() {
    this.editing = true;
  }

  finishEditing() {
    this.editing = false;
    const taskUpdated = {
      ...this.currentTask,
      assignedBy: this.holdData.userInfo.email,
      timestamp: this.holdData.convertJSCustomDateIntoFirestoreTimestamp(this.currentTask.timestamp),
    }
    this.updateTask(taskUpdated);
  }

  finishTask() {
    const taskFinished = {
      ...this.currentTask,
      finished: true,
    }
    this.taskList = this.checkTaskInArray(this.taskList, this.currentTask.taskId);
    this.taskListPersonal = this.checkTaskInArray(this.taskListPersonal, this.currentTask.taskId);
    this.showTask = false;
    this.updateTask(taskFinished);
  }

  private createTaskFirebase(data){
    // creation of new task
    return this.setData.createTask(this.holdData.userInfo.companyId, data)
    .then(()=>{
        this._snackBar.open('Tarea creada con exito', 'Cerrar', {
          duration: 3000,
          horizontalPosition: this.horizontalPosition,
          verticalPosition: this.verticalPosition,
        });
    })
  }
  
  checkTaskInArray(array: Array<any>, taskId: string) {
    const rta = array.filter(t => t.taskId !== taskId);
    return rta;
  }
}
