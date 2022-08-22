import { Component, OnInit } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
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
import 'firebase/firestore';

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
  tempDataSource: Array<any> = [];
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
  downloadJsonHref: any;
  // PORTHOS EXCLUSIVE
  averageRate: number;
  selectedFilter: string;
  keyWordFilter: string;
  gradesIndividual = {
    five: 0,
    four: 0,
    three: 0,
    two: 0,
    one: 0,
    zero: 0
  }
  dataSourceMeta: {data: any[], total: number, maxPage: number, currentPage: number};
  currentPage: number = 1
  pieChartStatistics: {name: string, value: number}[] = [];

  constructor(
    private fetchData: FecthDataService,
    private holdData: HoldDataService,
    private setData: SetDataService,
    private router: Router,
    public dialog: MatDialog,
    private _snackBar: MatSnackBar,
    private sanitizer: DomSanitizer
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
          this.tempDataSource = dataRta;      
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
    this.tempDataSource = [];
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
          this.tempDataSource = dataRta;
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
    this.dataSourceMeta = null;  
    if (this.currentForm.foreign) {
      this.fetchData.getResultsFormsForeign({
        api_url: (this.holdData.companyInfo.api_url) ? this.holdData.companyInfo.api_url : null,
        begin: this.convertDate(this.datePick.begin),
        end: this.convertDate(this.datePick.end),
        page: this.currentPage
      })
        .subscribe((dataRta: any) => {
          console.log(dataRta)
          this.dataSourceMeta = dataRta;    
          Object.keys(dataRta.data).forEach(k => {
            tempArr.push(dataRta.data[k]);
          })
          this.dataSource = tempArr; 
          this.tempDataSource = tempArr; 
          this.responsesLength = dataRta.total;
          this.dataSource.map(d => {
            if (!this.filterCases.includes(d.punto)) {
              this.filterCases.push(d.punto);
            }
          });    
          this.filterCases.push('Todos');                 
        })
    } else {
      if (this.isActive) this.isActive.unsubscribe();
      const dateToSend =  this.holdData.convertJSCustomDateIntoFirestoreTimestamp(this.datePick)
      this.isActive = this.fetchData.getResultsFormsWithDate(this.companyId, this.currentForm, dateToSend)
        .subscribe(dataRta => {
          this.dataSource = dataRta;
          this.tempDataSource = dataRta; 
        })
    }
  }

  pageEvent(event) {
    this.averageRate = null;
    this.selectedFilter = 'Todos';
    this.selectedFilter = null;
    this.currentPage = event.pageIndex + 1;
    this.searchFields();
  }

  selectFilter(event) {
    if (event.value !== 'Todos') {
      this.dataSource = this.tempDataSource.filter(item => {
        if(event.value === item.punto) return item;
      });
      let rate: number = 0;
      let counter: number = 0;
      this.tempDataSource.forEach(d => {
        if (d.punto === event.value) {
          rate = rate + d.calificacion
          counter++;
        }
      });
      this.responsesLength = this.dataSource.length;
      this.averageRate = rate / counter;
      this.getGradingTotal();
    } else {
      this.dataSource = this.tempDataSource;
      this.averageRate = null;
      this.responsesLength = this.dataSource.length;
    }    
  }

  getGradingTotal() {
    const five = this.dataSource.filter(item => item.calificacion === 5);
    this.gradesIndividual.five = five.length;
    const four = this.dataSource.filter(item => item.calificacion === 4);
    this.gradesIndividual.four = four.length;
    const three = this.dataSource.filter(item => item.calificacion === 3);
    this.gradesIndividual.three = three.length;
    const two = this.dataSource.filter(item => item.calificacion === 2);
    this.gradesIndividual.two = two.length;
    const one = this.dataSource.filter(item => item.calificacion === 1);
    this.gradesIndividual.one = one.length;
    const zero = this.dataSource.filter(item => item.calificacion === 0);
    this.gradesIndividual.zero = zero.length;
    if ( this.pieChartStatistics.length === 0) {
      Object.keys(this.gradesIndividual).forEach(key => {
        this.pieChartStatistics.push({
          name: key,
          value: this.gradesIndividual[key]
        })
      });
    } else {
      Object.keys(this.gradesIndividual).forEach(key => {
        this.pieChartStatistics.forEach((item, index) => {
          if (item.name === key) {
            this.pieChartStatistics[index] = {
              name: item.name,
              value: this.gradesIndividual[key]
            }
          }
        })
      });
      this.pieChartStatistics = [...this.pieChartStatistics];
    }
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

  private ConvertToCSV(objArray) {
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
          let data = array[i][index];
          if (data && typeof(data) === 'object') data = data.toDate();
          if (data && typeof(data) === 'string') data.replace(',', '');
          if (line != '') line += ','
          line += data;
        }
        str += line + '\r\n';
    }
    return str;
  }

  private flattenArrayOfResults() {
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

  onChangeKeyWordFilter(event) {
    this.dataSource = this.tempDataSource.filter(item => {
      if(this.selectedFilter === item.punto) return item;
    });
    this.dataSource = this.dataSource.filter(item => {
      if (item.comentarios && item.comentarios.toLowerCase().includes(event.toLowerCase())) return item;
    }).map(itemMap => {
      return {
        ...itemMap,
        comentarios: itemMap.comentarios.includes(event) ? itemMap.comentarios.replace(event, `<span class=highlight>${event}</span>`) : itemMap.comentarios
      }
    });
  }

}