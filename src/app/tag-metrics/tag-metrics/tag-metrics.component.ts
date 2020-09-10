import { Component, OnInit } from '@angular/core';
import { DeleteDataService } from 'app/core/services/delete-data.service';
import { HoldDataService } from 'app/core/services/hold-data.service';
import { SetDataService } from 'app/core/services/set-data.service';
import { FecthDataService } from 'app/core/services/fecth-data.service';
import { Router } from '@angular/router';
@Component({
  selector: 'app-tag-metrics',
  templateUrl: './tag-metrics.component.html',
  styleUrls: ['./tag-metrics.component.css']
})
export class TagMetricsComponent implements OnInit {
  times
  tagsCategories:any = [];
  tagsCategoriesNames:any = [];
  companyId:string;
  
  view: any[] = [1000, 300];
  saleData:any =[];
  // options
  gradient: boolean = true;
  showLegend: boolean = true;
  showLabels: boolean = true;
  isDoughnut: boolean = false;
  transferenceArray:any =[];
  tagsStatistics:any =[];
  colorScheme = {
    domain: ['#5AA454', '#A10A28', '#C7B42C', '#AAAAAA']
  };

  constructor(private fetchData: FecthDataService,
    private setData: SetDataService,
    private holdData: HoldDataService,
    private deleteData: DeleteDataService,
    private router: Router,
    ) { 
      this.saleData = [
        { name: "Mobiles", value: 105000 },
        { name: "Laptop", value: 55000 },
        { name: "AC", value: 15000 },
        { name: "Headset", value: 150000 },
        { name: "Fridge", value: 20000 }
      ];
    }

  ngOnInit(): void {
    if (!this.holdData.companyInfo) {
      this.router.navigate(['no-comp'])
    }
    this.companyId = this.holdData.userInfo.companyId;
 
    this.getCategories();
  }
  onSelect(data): void {
    console.log('Item clicked', JSON.parse(JSON.stringify(data)));
  }

  onActivate(data): void {
    console.log('Activate', JSON.parse(JSON.stringify(data)));
  }

  onDeactivate(data): void {
    console.log('Deactivate', JSON.parse(JSON.stringify(data)));
  }
  getCategories(){
    // get categories
    

    this.fetchData.getTags(this.companyId)
    .subscribe(data => {
      this.tagsCategoriesNames = data;
      this.tagsCategories = [];
        console.log(data);
        
      
    })
  }
  getSpecificTags(category){
    this.fetchData.getSpecificTag(category.categoryId,this.companyId)
    .subscribe(data => {
      
      this.tagsCategories = data;
    })
  }

}
