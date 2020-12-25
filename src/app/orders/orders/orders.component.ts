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
import { MatSort } from '@angular/material/sort';
import { BreakpointObserver } from '@angular/cdk/layout';
import { SetDataService } from '../../core/services/set-data.service';
import { order } from '../../../interfaces/orders';

// let ListOfOrders: order[] = [];

@Component({
  selector: 'app-orders',
  templateUrl: './orders.component.html',
  styleUrls: ['./orders.component.scss'],
})


export class OrdersComponent implements OnInit {
    displayedColumns = ['orderId',  'deliverMode', 'timestamp','actions'];
    dataSource: any[] = [];
    dataSourceBack: any[] = []; // used to filter
    orderInformation:any;
    order:order;
    showTable:boolean = false;
    ordersSubscriber: any;
    filterValue: string = '';
    // listOfOrders:Array<order>;
    showTableOrders=null;
    fullOrders:any[] = [];
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
      // breakpointObserver.observe(['(max-width: 600px)']).subscribe(result => {
      //   this.displayedColumns = result.matches ?
      //       ['orderId',  'deliverMode', 'timestamp','actions'] :
      //       ['orderId',  'deliverMode', 'timestamp','actions'];
      // });
     }
    applyFilter(filterValue: string) {
      this.dataSource = this.dataSourceBack;
      if (filterValue.length < this.filterValue.length) {
        filterValue = filterValue.trim();
        this.dataSource = this.dataSource.filter(d => {
          if (d.orderId.includes(filterValue)) return d; 
        })
      } else {
        this.filterValue = filterValue.trim();
        this.dataSource = this.dataSource.filter(d => {
          if (d.orderId.includes(this.filterValue)) return d; 
        })
      }
    }

    ngOnInit() {
      this.ordersSubscriber = this.fetchData.getOrders(this.holdData.userInfo.companyId )
      .subscribe( res => {
        //save all the orders from firestore
        this.fullOrders = res;
        //show only the orders according to the tab
        if (this.showTableOrders === null) {
          this.fullOrders.forEach(element => {
            if (element.state === 'pending') {
              this.dataSource.push(element)            
            }
          });
        }

          
        
        
        
      });
    }
    
    prepareOrder(order){     
      console.log(order);
      
      // this.setData.startPreparingOrder(this.holdData.userInfo.companyId, order.orderId)
    }
    showOrdersInTable(event){
      this.dataSource=[];
      if (event.tab.textLabel === 'Pendientes') {
        this.showTableOrders='pending';
        this.showOnlyPendingOrders();
      } else if (event.tab.textLabel === 'En preparación') {
        this.showTableOrders='inProgress';
        this.showOnlyInProgressOrders()
      } else if(event.tab.textLabel === 'Despachados') {
        this.showTableOrders='delivered';
        this.showOnlyDeliveredOrders()
      }
      
      
      
      
    }
    showOnlyPendingOrders(){
      this.dataSource = [];
      
      this.fullOrders.forEach(element => {
        if (element.state === 'pending') {
          this.dataSource.push(element)            
        }
      });
    }
    showOnlyInProgressOrders(){
      this.dataSource = [];
      this.fullOrders.forEach(element => {
        if (element.state === 'inProgress') {
          this.dataSource.push(element)            
        }
      });
    }
    showOnlyDeliveredOrders(){
      this.dataSource = [];
      this.fullOrders.forEach(element => {
        if (element.state === 'delivered') {
          this.dataSource.push(element)            
        }
      });
    }
    details(element){
      this.holdData.currentOrder = element;
      this.router.navigate(['/orderdetails']);
    }
    
    ngOnDestroy() {
      if(this.ordersSubscriber) this.ordersSubscriber.unsubscribe();
    }
}
