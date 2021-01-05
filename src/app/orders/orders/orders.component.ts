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
        res.map(d => {
          const itemData = d.payload.doc.data();
          if (d.type === 'added') this.dataSourceBack.push(itemData);
          if (d.type === 'modified') {
            const filterDataModified = this.dataSourceBack.filter((i) => {
              if (i.orderId !== itemData.orderId) return i;
            });
            filterDataModified.push(itemData);
            this.dataSourceBack = filterDataModified;
          }
        })
        this.dataSource = this.dataSourceBack;
      });
    }

    prepareOrder(order){     
      this.setData.startPreparingOrder(this.holdData.userInfo.companyId, order.orderId)
    }

    details(element){
      this.holdData.currentOrder = element;
      this.router.navigate(['/orderdetails']);
    }
    
    ngOnDestroy() {
      if(this.ordersSubscriber) this.ordersSubscriber.unsubscribe();
    }
}
