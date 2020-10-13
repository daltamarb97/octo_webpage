import { Component, OnInit, ViewChild } from '@angular/core';
import { MatTable, MatTableDataSource } from '@angular/material/table';
import { MatDialog } from '@angular/material/dialog';

export interface TicketElement {
  id: number;
  creator: string;
  title: string;
  assignee: string;
  status: string;
  labelbg: string;
  product: string;
  date: string;
}

const tickets: TicketElement[] = [
  {
      id: 77,
      creator: 'Eric Pratt',
      title: 'Elegant Theme Side Menu show OnClick',
      assignee: 'Alice Bohr',
      status: 'In Progress',
      labelbg: 'warning',
      product: 'Elegant Admin',
      date: '2018-05-01'
  },
  {
      id: 78,
      creator: 'Steve',
      title: 'Xtreme theme dropdown issue',
      assignee: 'Jonathan',
      status: 'Open',
      labelbg: 'success',
      product: 'Xtreme Admin',
      date: '2018-05-03'
  },
  {
      id: 79,
      creator: 'Mark',
      title: 'Header issue in material admin',
      assignee: 'Smith J',
      status: 'Closed',
      labelbg: 'danger',
      product: 'Material Admin',
      date: '2018-05-02'
  },
  {
      id: 80,
      creator: 'John Doe',
      title: 'Sidebar issue in Nice admin',
      assignee: 'Vincent',
      status: 'In Progress',
      labelbg: 'warning',
      product: 'Nice Admin',
      date: '2018-05-06'
  },
  {
      id: 81,
      creator: 'Jennifer',
      title: 'Elegant Theme Side Menu show OnClick',
      assignee: 'Chris Martin',
      status: 'Open',
      labelbg: 'success',
      product: 'Elagant Admin',
      date: '2018-05-04'
  },
  {
      id: 82,
      creator: 'Harper',
      title: 'Header issue in admin pro admin',
      assignee: 'James F',
      status: 'Closed',
      labelbg: 'danger',
      product: 'Adminpro Admin',
      date: '2018-05-03'
  },
  {
      id: 83,
      creator: 'Billy John',
      title: 'Elegant Theme Side Menu OnClick',
      assignee: 'Jonathan',
      status: 'In Progress',
      labelbg: 'warning',
      product: 'Elegant Admin',
      date: '2018-05-05'
  },
  {
      id: 84,
      creator: 'Allen Brook',
      title: 'adminpress Theme Side Menu not opening',
      assignee: 'Smith J',
      status: 'Open',
      labelbg: 'success',
      product: 'Adminpress Admin',
      date: '2018-05-04'
  },
  {
      id: 85,
      creator: 'Olivia Hart',
      title: 'Charts not proper in xtreme admin',
      assignee: 'Markus',
      status: 'Closed',
      labelbg: 'danger',
      product: 'Xtreme Admin',
      date: '2018-05-02'
  },
  {
      id: 86,
      creator: 'Luis Orys',
      title: 'Psd not availabel with package',
      assignee: 'Jane',
      status: 'Closed',
      labelbg: 'danger',
      product: 'Material Admin',
      date: '2018-05-03'
  }
];

@Component({
  selector: 'app-tickets-list',
  templateUrl: './tickets-list.component.html',
  styleUrls: ['./tickets-list.component.scss']
})


export class TicketsListComponent implements OnInit {

  @ViewChild(MatTable, { static: true }) table: MatTable<any> = Object.create(null);
    constructor(public dialog: MatDialog) { }
    searchText: any;
    totalCount = -1;
    Closed = -1;
    Inprogress = -1;
    Open = -1;

    displayedColumns: string[] = ['creator', 'title', 'assignee', 'status', 'product', 'date', 'action'];
    dataSource = new MatTableDataSource(tickets);



    // openDialog(action: string, obj: any) {
    //     obj.action = action;
    //     const dialogRef = this.dialog.open(TicketDialogContent, {
    //         data: obj
    //     });

    //     dialogRef.afterClosed().subscribe(result => {
    //         if (result.event === 'Add') {
    //             this.addRowData(result.data);
    //         } else if (result.event === 'Update') {
    //             this.updateRowData(result.data);
    //         } else if (result.event === 'Delete') {
    //             this.deleteRowData(result.data);
    //         }
    //     });
    // }

    addRowData(row_obj: TicketElement) {
        const d = new Date();
        this.dataSource.data.push({
            id: d.getTime(),
            creator: row_obj.creator,
            title: row_obj.title,
            assignee: row_obj.assignee,
            status: row_obj.status,
            labelbg: row_obj.labelbg,
            product: row_obj.product,
            date: row_obj.date,
        });
        this.table.renderRows();

    }
    updateRowData(row_obj: TicketElement) {
        this.dataSource.data = this.dataSource.data.filter((value, key) => {
            if (value.id === row_obj.id) {
                value.creator = row_obj.creator;
                value.title = row_obj.title;
                value.assignee = row_obj.assignee;
                value.status = row_obj.status;
                value.labelbg = row_obj.labelbg;
                value.product = row_obj.product;
                value.date = row_obj.date;
            }
            return true;
        });
    }
    deleteRowData(row_obj: TicketElement) {
        this.dataSource.data = this.dataSource.data.filter((value, key) => {
            return value.id !== row_obj.id;
        });
    }

    ngOnInit() {
        this.totalCount = this.dataSource.data.length;
        this.Open = this.btnCategoryClick('Open');
        this.Closed = this.btnCategoryClick('Closed');
        this.Inprogress = this.btnCategoryClick('In Progress');
        this.dataSource = new MatTableDataSource(tickets);
    }

    applyFilter(filterValue: string) {
        this.dataSource.filter = filterValue.trim().toLowerCase();
    }

    btnCategoryClick(val: string) {
        this.dataSource.filter = val.trim().toLowerCase();
        return this.dataSource.filteredData.length;
    }

}
