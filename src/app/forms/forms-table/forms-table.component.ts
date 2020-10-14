import { Component, OnInit } from '@angular/core';
import { animate, state, style, transition, trigger } from '@angular/animations';
import { FecthDataService } from '../../core/services/fecth-data.service';
import { HoldDataService } from '../../core/services/hold-data.service';

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

  dataSource: Array<any> = [];
  columnsToDisplay = [];
  expandedElement;
  companyId: string;
  forms: Array<any> = [];

  constructor(
    private fetchData: FecthDataService,
    private holdData: HoldDataService
  ) { }

  ngOnInit(): void {
    this.companyId = this.holdData.companyInfo.companyId;
    this.getForms();
  }

  async getForms() {
    this.forms = await this.fetchData.getFormsInfo(this.companyId);    
    const cols = await this.fetchData.getFormCols(this.companyId, this.forms[0].formId);
    const data =  await this.fetchData.getResultsForms(this.companyId, this.forms[0].formId);
    cols.forEach(c => {
      this.columnsToDisplay.push(c.alias);
    })
    data.forEach(i => {
      
    })
  }

  show(element) {
    console.log(element);
    
  }

}