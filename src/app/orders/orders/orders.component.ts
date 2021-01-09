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
    displayedColumns: string[]= ['orderId', 'deliverMode', 'paymentMethod', 'timestamp', 'actions'];
    dataSource: any[] = [];
    dataSourceBack: any[] = []; // used to filter
    orderInformation:any;
    order:order;
    showTable:boolean = false;
    ordersSubscriber: any;
    filterValue: string = '';
    // listOfOrders:Array<order>;
    showTableOrders:string=null;
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
     
     }
    applyFilter(filterValue: string) {
      this.dataSource = this.dataSourceBack;
      this.showOrdersInTable();
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
          let itemData = d.payload.doc.data();
          itemData.id =  d.payload.doc.id;
          if (d.type === 'added'){
            if (!this.showTableOrders) return this.dataSourceBack.push(itemData);            
          }  
          if (d.type === 'modified') {
            const filterDataModified = this.dataSourceBack.filter((i) => {
              if (i.orderId !== itemData.orderId) return i;
            });
            filterDataModified.unshift(itemData);
            this.dataSourceBack = filterDataModified;
          }
        })
        this.dataSource = this.dataSourceBack;
        if (!this.showTableOrders) {   
          this.showTableOrders = 'pending'   
          this.showOnlyPendingOrders();    
        } else {
          this.showOrdersInTable();
        }
      });
  }


  async prepareOrder(order){    
    // send update
    const data = {
      message: `_¡Tu pedido con código_ *${order.orderId}* _ha sido confirmado y está siendo preparado!_ 👨🏽‍🍳 👩🏽‍🍳`,
      number: order.whatsappPhone,
      companyId: this.holdData.userInfo.companyId,
      api_url: this.holdData.companyInfo.api_url
    }
    try {
      const notificationResponse = await this.setData.sendOrderUpdateHttp(data).toPromise(); 
      this.setData.startPreparingOrder(this.holdData.userInfo.companyId, order.id);
      this._snackBar.open('El estado del pedido cambio a "En preparación"', 'Ok', {
        duration: 4000,
      });
      this.showOnlyPendingOrders();
    } catch(error) {
      console.log(error);
    }
  }
    
  async deliverOrder(order){    
    // send update
    const data = {
      message: `_¡Tu pedido con código_ *${order.orderId}* _está listo y está siendo enviado a tu dirección!_ 🛵💨`,
      number: order.whatsappPhone,
      companyId: this.holdData.userInfo.companyId,
      api_url: this.holdData.companyInfo.api_url
    }
    try {
      const notificationResponse = await this.setData.sendOrderUpdateHttp(data).toPromise(); 
      this.setData.deliveringOrder(this.holdData.userInfo.companyId, order.id)
      this._snackBar.open('El estado del pedido cambio a "En camino"', 'Ok', {
        duration: 4000,
      });
      this.showOnlyInProgressOrders();
    } catch(error) {
      console.log(error);
    }
  }
  
  showOrdersInTable(){
    //show the orders that correspond with the tab
    if ( this.showTableOrders ==='pending') {   
      this.showOnlyPendingOrders();
    } else if ( this.showTableOrders ==='inProgress') {
      this.showOnlyInProgressOrders();
    } else if( this.showTableOrders ==='delivered' ) {
      this.showOnlyDeliveredOrders()
    }     
  }

  changeTab(event){
    if (event.tab.textLabel === 'Pendientes') {
      this.showTableOrders='pending';
      this.showOnlyPendingOrders();
    } else if (event.tab.textLabel === 'En preparación' ) {
      this.showTableOrders='inProgress';
      this.showOnlyInProgressOrders();
    } else if(event.tab.textLabel === 'Despachados' ) {
      this.showTableOrders='delivered';
      this.showOnlyDeliveredOrders()
    } 
  }

  showOnlyPendingOrders(){
    this.dataSource = [];
      this.dataSourceBack.map(p=>{
        if (p.state === 'pending' || p.state === 'transfer-pending') {
          this.dataSource.push(p)            
        }
      });   
  }
   
    showOnlyInProgressOrders(){
      this.dataSource = [];
      this.dataSourceBack.map(p=>{
        if (p.state === 'inProgress') {
          this.dataSource.push(p)            
        }
      }); 
    }

    showOnlyDeliveredOrders(){
      this.dataSource = [];
      this.dataSourceBack.map(p=>{
        if (p.state === 'delivered' || p.state === 'received') {
          this.dataSource.push(p)            
        }
      });
    }

    async details(element){
      await this.setData.setUnseenToFalseOrder(this.holdData.userInfo.companyId, element.id);
      this.holdData.currentOrder = element;
      this.router.navigate(['/orderdetails']);
    }
    
    ngOnDestroy() {
      if(this.ordersSubscriber) this.ordersSubscriber.unsubscribe();
    }
}
