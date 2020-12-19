import { Component, OnInit } from '@angular/core';
import { animate, state, style, transition, trigger } from '@angular/animations';
import { FecthDataService } from '../../core/services/fecth-data.service';
import { HoldDataService } from '../../core/services/hold-data.service';
import { SetDataService } from '../../core/services/set-data.service';
import { Router } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { TicketDialogComponent } from '../../material-component/ticket-dialog/ticket-dialog.component';
import { MatSnackBar } from '@angular/material/snack-bar';
import { DateAdapter, MAT_DATE_FORMATS, NativeDateAdapter } from 'saturn-datepicker'
import { formatDate } from '@angular/common';


export const PICK_FORMATS = {
  parse: {dateInput: {month: 'short', year: 'numeric', day: 'numeric'}},
  display: {
      dateInput: 'input',
      monthYearLabel: {year: 'numeric', month: 'short'},
      dateA11yLabel: {year: 'numeric', month: 'long', day: 'numeric'},
      monthYearA11yLabel: {year: 'numeric', month: 'long'}
  }
};

class PickDateAdapter extends NativeDateAdapter {
  format(date: Date, displayFormat: Object): string {
      if (displayFormat === 'input') {
          return formatDate(date,'dd-MMM-yyyy',this.locale);
      } else {
          return date.toDateString();
      }
  }
}

@Component({
  selector: 'app-forms-table',
  templateUrl: './forms-table.component.html',
  styleUrls: ['./forms-table.component.scss'],
  animations: [
    trigger('detailExpand', [
        state('collapsed', style({ height: '0px', minHeight: '0' })),
        state('expanded', style({ height: '*' })),
        transition('expanded <=> collapsed', animate('225ms cubic-bezier(0.4, 0.0, 0.2, 1)')),
    ]),
],
  providers: [
    {provide: DateAdapter, useClass: PickDateAdapter},
    {provide: MAT_DATE_FORMATS, useValue: PICK_FORMATS},
  ]
})

export class FormsTableComponent implements OnInit {

  dataSource: Array<any> = [];
  columnsToDisplay = ['numero','acciones'];
  companyId: string;
  companyInfo: any;
  forms: Array<any> = [];
  currentForm: any;
  showTable: boolean = true;
  formFlow: Array<any> = [];
  edition: boolean = false;
  messageEdition: string = null;
  typeMessageEdition: string = null;
  missingEditInfo: boolean = false;
  isActive: any;
  expandedElement: null;
  expandedData: Array<any> = [];
  expandedDataNames: Array<any> = [];
  datePick: any;
  showCardsVersion: boolean = false;
  filterCases: Array<number | string> = [];
  responsesLength: number;
  // PORTHOS EXCLUSIVE
  averageRate: number;
  selectedFilter: string;

  constructor(
    private fetchData: FecthDataService,
    private holdData: HoldDataService,
    private setData: SetDataService,
    private router: Router,
    public dialog: MatDialog,
    private _snackBar: MatSnackBar,
  ) { }

  async ngOnInit() {
    if (!this.holdData.companyInfo) {
      this.router.navigate(['no-comp'])
    }
    this.companyInfo = this.holdData.companyInfo;
    this.companyId = this.holdData.companyInfo.companyId;
    await this.getForms();
  }

  async getForms() {
    this.forms = await this.fetchData.getFormsInfo(this.companyId);  
    this.currentForm = this.forms[0]; 
    if (
      this.currentForm.formId === 'I7vdIZKaWSs5xZuffL85' || 
      this.currentForm.formId === '341LZce0tV0SEBqj8Qqq') this.showCardsVersion = true;   
    let formFlow = null;
    if (!this.currentForm.foreign) {
      this.isActive = this.fetchData.getResultsForms(this.companyId, this.currentForm)
        .subscribe(dataRta => {
          this.dataSource = dataRta;          
        });
      formFlow = await this.fetchData.getSingleFormInfo(this.companyId, this.currentForm);
      formFlow.forEach(d => {
        this.formFlow.push(d.data());
      })
    }
  }

  async changeForm(formInfo) {
    this.showCardsVersion = false; 
    this.currentForm = formInfo;
    if (
      this.currentForm.formId === 'I7vdIZKaWSs5xZuffL85' || 
      this.currentForm.formId === '341LZce0tV0SEBqj8Qqq') this.showCardsVersion = true;
    this.dataSource = [];
    this.datePick = null;
    // empty variables
    this.formFlow = [];
    let formFlow = null;
    // 
    if (!this.currentForm.foreign) {
      if (this.isActive) this.isActive.unsubscribe();
      this.isActive = this.fetchData.getResultsForms(this.companyId, this.currentForm)
        .subscribe(dataRta => {          
          this.dataSource = dataRta;
        })
      formFlow = await this.fetchData.getSingleFormInfo(this.companyId, this.currentForm);
      formFlow.forEach(d => {
        this.formFlow.push(d.data());
      })     
    } else {
      this.showTable = true;
    }
  }

  searchFields() {
    this.formFlow = [];
    let tempArr = [];    
    if (this.currentForm.foreign) {
      this.fetchData.getResultsFormsForeign({
        api_url: (this.holdData.companyInfo.api_url) ? this.holdData.companyInfo.api_url : null,
        begin: this.convertDate(this.datePick.begin),
        end: this.convertDate(this.datePick.end)
      })
        .subscribe(dataRta => {          
          Object.keys(dataRta).forEach(k => {
            tempArr.push(dataRta[k]);
          })
          this.dataSource = tempArr;  
          this.responsesLength = this.dataSource.length;
          this.dataSource.map(d => {
            if (!this.filterCases.includes(d.punto)) {
              this.filterCases.push(d.punto);
            }
          });                     
        })
    } else {
      if (this.isActive) this.isActive.unsubscribe();
      const dateToSend =  this.holdData.convertJSCustomDateIntoFirestoreTimestamp(this.datePick)
      this.isActive = this.fetchData.getResultsFormsWithDate(this.companyId, this.currentForm, dateToSend)
        .subscribe(dataRta => {
          this.dataSource = dataRta;
        })
    }
  }

  selectFilter(event) {
    let rate: number = 0;
    let counter: number = 0;
    this.dataSource.map(d => {
      if (d.punto === event.value) {
        rate = rate + d.calificacion
        counter++;
      }
    }); 
    this.averageRate = rate / counter;
  }

  convertDate(str) {
    var date = new Date(str),
    month = ("0" + (date.getMonth() + 1)).slice(-2),
    day = ("0" + date.getDate()).slice(-2);
    return [date.getFullYear(), month, day].join("-");
  }

  openTicket(element) {
    // create ticket and redirect user to whatsapp
    const dialogRef = this.dialog.open(TicketDialogComponent, {data: {
        creator: `${this.holdData.userInfo.name} ${this.holdData.userInfo.lastname}`
      }});
      dialogRef.afterClosed()
          .subscribe(async result => {
              // create new chat room 
              if (result.event === 'Cancel' || result.event === undefined) {} else if (result.event === 'Success') {
                let ticket = result.data;
                ticket.phone = (element.number) ? element.number : element.telefono;
                (ticket.phone.includes('whatsapp:')) 
                  ? ticket.phone = ticket.phone
                  : (this.companyInfo.name === 'Porthos') ? ticket.phone = `whatsapp:+57${ticket.phone}` : ticket.phone = `whatsapp:${ticket.phone}`
                ticket.status = 'Pendiente';
                this.fetchData.getSingleWhatsappChat(this.companyId, ticket.phone)
                  .subscribe(async data => {
                    if(data.data()) {
                      if(!data.data().hasTicket) {
                        const ticketId: any = await this.setData.createTicket(ticket, this.companyId);
                        this.setData.sendHasTicket(ticket.phone, this.companyId, ticketId);
                        this._snackBar.open(`Se ha creado un ticket asociado a el número: ${ticket.phone}, ve a la pestaña de WhatsApp para ver detalles del ticket`, 'Ok');
                      } else {
                        this._snackBar.open(`Ya existe un ticket asociado a el número: ${ticket.phone}, no es posible crear un nuevo ticket`, 'Ok');
                      }
                    } else {
                      const ticketId: any = await this.setData.createTicket(ticket, this.companyId);
                      const newChatData = {
                        number: ticket.phone,
                        assignTo: [{
                          email: this.holdData.userInfo.email,
                          name: `${this.holdData.userInfo.name} ${this.holdData.userInfo.lastname}`,
                          userId: this.holdData.userId
                        }],
                        ticketId: ticketId
                      }
                      await this.setData.createWhatsappChatFromForms(this.companyId, newChatData);
                      this._snackBar.open(`Se ha creado un ticket y un chat asociado a el número: ${ticket.phone}, ve a la pestaña de WhatsApp para ver detalles del ticket`, 'Ok');
                    }
                  })
              }
          });
  }

  async confirmMessageChanges(message) {
    this.missingEditInfo = false;
    if(!this.messageEdition) {
      this.missingEditInfo = true;
    } else {
      const data = {
        companyId: this.companyId,
        formId: this.currentForm.formId,
        questionId: message.questionId,
        message: this.messageEdition,
        responseType: 
          (this.typeMessageEdition) 
            ? this.typeMessageEdition 
            : (message.responseType) ? message.responseType : null
      }
      await this.setData.updateFormMessage(data);
      const formFlow = await this.fetchData.getSingleFormInfo(this.companyId, this.currentForm);
      this.formFlow = [];
      this.missingEditInfo = false;
      this.typeMessageEdition = null;
      this.messageEdition = null;
      this.edition = false;
      formFlow.forEach(d => {
        this.formFlow.push(d.data());
      })
    }
  }

  cancelChanges(){
    this.missingEditInfo = false;
    this.typeMessageEdition = null;
    this.messageEdition = null;
    this.edition = false;
  }

  getRowData(element){    
    this.expandedData = [];
    this.expandedDataNames = [];
    if (element.results) {
      Object.keys(element.results).forEach(k => {
        this.expandedData.push(element.results[k]);
        this.expandedDataNames.push(k);
      })
    } else {
      Object.keys(element).forEach(k => {
        this.expandedData.push(element[k]);
        this.expandedDataNames.push(k)
      })
    }
  }

  downloadData() {
    let csvData;
    if (!this.currentForm.foreign) {
      const flattenedArray = this.flattenArrayOfResults();
      csvData = this.ConvertToCSV( flattenedArray);
    } else {
      csvData = this.ConvertToCSV( this.dataSource);
    }
    const a = document.createElement("a");
    a.setAttribute('style', 'display:none;');
    document.body.appendChild(a);
    const blob = new Blob([csvData], { type: 'text/csv' });
    const url= window.URL.createObjectURL(blob);
    a.href = url;
    const x:Date = new Date();
    const link:string ="filename_" + x.getMonth() +  "_" +  x.getDay() + '.csv';
    a.download = link.toLocaleLowerCase();
    a.click();
  }

  ConvertToCSV(objArray) {
    let array = typeof objArray != 'object' ? JSON.parse(objArray) : objArray;
    let str = '';
    let row = "";
    for (let index in objArray[0]) {
        row += index + ',';
    }
    row = row.slice(0, -1);
    str += row + '\r\n';
    for (let i = 0; i < array.length; i++) {
        let line = '';
        for (let index in array[i]) {
            if (line != '') line += ','

            line += array[i][index];
        }
        str += line + '\r\n';
    }
    return str;
  }

  flattenArrayOfResults() {
    let responseArray = [];
    for (let i = 0; i < this.dataSource.length; i++ ){
      const rta = {
        nombre: this.dataSource[i].results.nombre, 
        problema: this.dataSource[i].results.problema, 
        producto: this.dataSource[i].results.producto, 
        sede: this.dataSource[i].results.sede, 
        fecha: this.dataSource[i].timestamp,
        number: this.dataSource[i].number
      };
      responseArray.push(rta);
    }
    return responseArray;
  }

}