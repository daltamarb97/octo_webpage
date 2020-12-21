import { Component, OnInit, ViewChild } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { MatDialog } from '@angular/material/dialog';
import { Router, NavigationExtras } from '@angular/router';
import { FecthDataService } from '../../core/services/fecth-data.service';
import { HoldDataService } from '../../core/services/hold-data.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import {
    ClosedTicketDialogComponent
  } from '../../material-component/closedticket-dialog/closedticket-dialog.component';
import { NativeDateAdapter, DateAdapter, MAT_DATE_FORMATS } from '@angular/material/core';
import { formatDate } from '@angular/common';
import { MatSort } from '@angular/material/sort';
import { BreakpointObserver } from '@angular/cdk/layout';
import { AppRoutingModule } from 'app/app.routing';
import { SetDataService } from 'app/core/services/set-data.service';


export interface order {
    clientName: string;
    clientPhone: number;
    comments: string;
    deliverMode: string;
    order: Array<any>;
    orderCost:string;
    orderId:string;
    packageCost:string;
    paymentMethod:string;
    state:string;
    timestamp:any;
    unseen:boolean;
}
const ListOfOrders: order[] = [];

@Component({
  selector: 'app-orders',
  templateUrl: './orders.component.html',
  styleUrls: ['./orders.component.scss'],
})


export class OrdersComponent implements OnInit {
    displayedColumns = ['orderId',  'deliverMode', 'timestamp','actions'];
    dataSource = new MatTableDataSource<order>(ListOfOrders);

    orderInformation:any;
    order:order;
    showTable:boolean = false;
    // listOfOrders:Array<order>;
    @ViewChild(MatSort, { static: true }) sort: MatSort = Object.create(null);
/**
     * Set the sort after the view init since this component will
     * be able to query its view for the initialized sort.
     */
  constructor(
        public dialog: MatDialog,
        private fetchData: FecthDataService,
        private holdData: HoldDataService,
        private setData: SetDataService,
        private router: Router,
        private _snackBar: MatSnackBar,
        breakpointObserver: BreakpointObserver
    ) {
      breakpointObserver.observe(['(max-width: 600px)']).subscribe(result => {
        this.displayedColumns = result.matches ?
            ['orderId',  'deliverMode', 'timestamp','actions'] :
            ['orderId',  'deliverMode', 'timestamp','actions'];
    });
     }
     applyFilter(filterValue: string) {
      filterValue = filterValue.trim(); // Remove whitespace
      filterValue = filterValue.toLowerCase(); // MatTableDataSource defaults to lowercase matches
      this.dataSource.filter = filterValue;
  }
    ngOnInit() {
        // this.dataSource.sort = this.sort;
        // this.fetchData.getOrdersStatistics(this.holdData.userInfo.companyId )
        // .subscribe( res => {
        //   // this.orderInformation = res
        //   // console.log(this.orderInformation);
          
        // });
        this.fetchData.getOrders(this.holdData.userInfo.companyId )
        .subscribe( res => {

          res.forEach(element => {
            let data: order = {
              clientName: element.clientName,
              clientPhone: element.clientPhone,
              comments: element.comments,
              deliverMode: element.deliverMode,
              order: element.order,
              orderCost:element.orderCost,
              orderId:element.orderId,
              packageCost:element.packageCost,
              paymentMethod:element.paymentMethod,
              state:element.state,
              timestamp:element.timestamp,
              unseen:element.unseen,
          }
            ListOfOrders.push(data)
          });
          this.showTable = true;
          this.dataSource = new MatTableDataSource<order>(ListOfOrders);
          console.log(ListOfOrders);
          
        });
    }
    prepareOrder(order){     
      this.setData.startPreparingOrder(this.holdData.userInfo.companyId,order.orderId)
    }
    details(element){
      console.log('detalles');
      let navigationExtras: NavigationExtras = {
        state: {
          data: element,       
        }
      };
      this.router.navigate(['/orderdetails'],navigationExtras);
    }
  
}
