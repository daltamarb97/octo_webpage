import { Component, OnInit, ViewChild } from '@angular/core';
import { MatTable, MatTableDataSource } from '@angular/material/table';
import { MatDialog } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { FecthDataService } from '../../core/services/fecth-data.service';
import { HoldDataService } from '../../core/services/hold-data.service';


export interface TicketElement {
  id: string;
  creator: string;
  title: string;
  assignee: string;
  status: string;
  labelbg: string;
  product: string;
  date: any;
}

let TICKETS: TicketElement[] = [];

@Component({
  selector: 'app-tickets-list',
  templateUrl: './tickets-list.component.html',
  styleUrls: ['./tickets-list.component.scss']
})


export class TicketsListComponent implements OnInit {

    dataSource = new MatTableDataSource<TicketElement>(TICKETS); 
    displayedColumns: string[] = ['creator', 'title', 'assignee', 'status', 'product', 'date', 'action'];

    companyId: string;
    searchText: any;
    totalCount = -1;
    Closed = -1;
    Inprogress = -1;
    Open = -1;

//   @ViewChild(MatTable, { static: true }) table: MatTable<any> = Object.create(null);
 
  constructor(
        public dialog: MatDialog,
        private fetchData: FecthDataService,
        private holdData: HoldDataService,
        private router: Router,
    ) { }

    ngOnInit() {
        if (!this.holdData.companyInfo) {
            this.router.navigate(['no-comp'])
        }
        this.companyId = this.holdData.companyInfo.companyId;
        this.fetchData.getTickets(this.companyId)
        .toPromise()
        .then(rtaInfo => {    
            rtaInfo.forEach(t => {
                const data: TicketElement = {
                    id: t.data().ticketId,
                    creator: t.data().creator,
                    title: t.data().title,
                    assignee: t.data().assignee,
                    status: t.data().status,
                    labelbg: t.data().labelbg,
                    product: t.data().product,
                    date: t.data().date.toDate(),
                }
                TICKETS.push(data);
            })
            this.totalCount = this.dataSource.data.length;
            this.Open = this.btnCategoryClick('open');
            this.Closed = this.btnCategoryClick('closed');
            this.Inprogress = this.btnCategoryClick('progress');
            this.btnCategoryClick('');
        })
    }

    applyFilter(filterValue: string) {
        this.dataSource.filter = filterValue.trim().toLowerCase();
    }

    btnCategoryClick(val: string) {
        this.dataSource.filter = val.trim().toLowerCase();
        return this.dataSource.filteredData.length;
    }
    
    goWhatsApp(element) {
        console.log(element, 'go whatsapp');
    }
}
