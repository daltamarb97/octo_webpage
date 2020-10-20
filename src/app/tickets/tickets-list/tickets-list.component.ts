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
  assignTo: Array<any>;
  status: string;
  description: string;
  phone: string;
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
    displayedColumns: string[] = ['creator', 'title', 'assignee', 'phone', 'status', 'date', 'action'];

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
                    assignTo: t.data().assignTo,
                    status: t.data().status,
                    description: t.data().description,
                    phone: t.data().phone,
                    // date: t.data().date.toDate(),
                    date: t.data().date
                }
                TICKETS.push(data);
            })
            this.totalCount = this.dataSource.data.length;
            this.Open = this.btnCategoryClick('Pendiente');
            this.Closed = this.btnCategoryClick('Completado');
            this.Inprogress = this.btnCategoryClick('En progreso');
            this.btnCategoryClick('');
        })
    }

    ngOnDestroy() {
        TICKETS.splice(0, TICKETS.length);
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
