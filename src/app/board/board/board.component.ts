import { Component, OnInit, ViewChild } from '@angular/core';
import { 
  MatDialog, 
  MatSnackBarHorizontalPosition, 
  MatSnackBarVerticalPosition, 
  MatSnackBar,
  MatTabGroup
} from '@angular/material';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';

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
  taskForm: FormGroup;
  // snack bar variables
  horizontalPosition: MatSnackBarHorizontalPosition = 'center';
  verticalPosition: MatSnackBarVerticalPosition = 'bottom';
  constructor(
    public dialog: MatDialog,
    private formBuilder: FormBuilder,
    private _snackBar: MatSnackBar,
    // services
    private fetchData: FecthDataService,
    private setData: SetDataService,
    private deleteData: DeleteDataService,
    private holdData: HoldDataService,
  ) { 
    this.buildForm();
  }

  ngOnInit(): void {
    this.userId = this.holdData.userId;
    this.companyInfo = this.holdData.companyInfo;
    this.getAnnouncements();
    this.getEmployees();
  }


  ngOnDestroy(){
    this.destroy$.next();
    this.destroy$.complete();
  }


  private getAnnouncements(){
    // get announcements of building
    this.taskList = [];
    this.fetchData.getCompanyTasks(this.holdData.userInfo.companyId)
    .pipe(
      takeUntil(this.destroy$)
    )
    .subscribe((announcements)=>{
      announcements.map(a => {
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


  createAnnouncement(){
    const formValue = this.taskForm.value;
    const resultData = {
      title: formValue.title,
      body: formValue.details,
      timestamp: this.holdData.convertJSCustomDateIntoFirestoreTimestamp(formValue.date),
      assignedTo: formValue.assigned
    };
    
     // creation of new task
     this.setData.createTask(this.holdData.userInfo.companyId, resultData)
     .then(()=>{
        this._snackBar.open('Tarea creada con exito', 'Cerrar', {
          duration: 3000,
          horizontalPosition: this.horizontalPosition,
          verticalPosition: this.verticalPosition,
        });

        this.taskForm.reset();
        this.tabGroup.selectedIndex = 0;
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
    this.setData.updateTask(this.holdData.userInfo.companyId, item.announcementId, data);
  }


  private deleteAnnouncement(item){
    // elimination of announcement
    this.deleteData.deleteTask(this.holdData.userInfo.companyId, item.announcementId);
  }

  private buildForm(){
    // build the login in form
    this.taskForm = this.formBuilder.group({
      title: ['', [Validators.required]],
      details: ['', [Validators.required]],
      assigned: ['', [Validators.required]],
      date: ['', [Validators.required]]
    })
  }

}
