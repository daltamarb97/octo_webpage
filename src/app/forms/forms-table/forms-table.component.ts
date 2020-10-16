import { Component, OnInit } from '@angular/core';
import { animate, state, style, transition, trigger } from '@angular/animations';
import { FecthDataService } from '../../core/services/fecth-data.service';
import { HoldDataService } from '../../core/services/hold-data.service';
import { MatTableDataSource } from '@angular/material/table';
import { SetDataService } from '../../core/services/set-data.service';
import { Router } from '@angular/router';

const ELEMENT_DATA: Element[] = [];

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
]
})

export class FormsTableComponent implements OnInit {

  dataSource = new MatTableDataSource<Element>(ELEMENT_DATA);
  columnsToDisplay = ['acciones'];
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

  constructor(
    private fetchData: FecthDataService,
    private holdData: HoldDataService,
    private setData: SetDataService,
    private router: Router,
  ) { }

  ngOnInit(): void {
    if (!this.holdData.companyInfo) {
      this.router.navigate(['no-comp'])
    }
    this.companyInfo = this.holdData.companyInfo;
    this.companyId = this.holdData.companyInfo.companyId;
    this.getForms();
  }

  async getForms() {
    ELEMENT_DATA.splice(0, ELEMENT_DATA.length);
    this.forms = await this.fetchData.getFormsInfo(this.companyId);  
    this.currentForm = this.forms[0];
    const formFlow = await this.fetchData.getSingleFormInfo(this.companyId, this.currentForm.formId);
    const cols = await this.fetchData.getFormCols(this.companyId, this.forms[0].formId);
    const data =  await this.fetchData.getResultsForms(this.companyId, this.forms[0].formId);
    formFlow.forEach(d => {
      this.formFlow.push(d.data());
    })
    cols.forEach(c => {
      this.columnsToDisplay.unshift(c.alias);
    })
    data.forEach(i => {
      ELEMENT_DATA.push(i.data().results);
    })
  }

  applyFilter(filterValue: string) {
    filterValue = filterValue.trim();
    filterValue = filterValue.toLowerCase();
    this.dataSource.filter = filterValue;
  }

  async changeForm(formInfo) {
    this.currentForm = formInfo;
    // empty variables
    this.columnsToDisplay = ['acciones'];
    ELEMENT_DATA.splice(0, ELEMENT_DATA.length);
    this.formFlow = [];
    // 
    const formFlow = await this.fetchData.getSingleFormInfo(this.companyId, this.currentForm.formId);
    const cols = await this.fetchData.getFormCols(this.companyId, this.currentForm.formId);
    const data =  await this.fetchData.getResultsForms(this.companyId, this.currentForm.formId);
    formFlow.forEach(d => {
      this.formFlow.push(d.data());
    })
    cols.forEach(c => {
      this.columnsToDisplay.unshift(c.alias);
    })
    data.forEach(i => {
      ELEMENT_DATA.push(i.data().results);
    })
  }

  openTicket(element) {
    // here goes logic of ticket redirection
    console.log(element);
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
      const formFlow = await this.fetchData.getSingleFormInfo(this.companyId, this.currentForm.formId);
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
  
}