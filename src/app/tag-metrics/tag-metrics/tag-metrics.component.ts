import { Component, OnInit } from '@angular/core';
import { HoldDataService } from '../../../app/core/services/hold-data.service';
import { FecthDataService } from '../../../app/core/services/fecth-data.service';
import { Router, NavigationExtras } from '@angular/router';
import { takeUntil } from 'rxjs/operators';
import { Subject } from 'rxjs';
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
  }
  total:number= 0;
  destroy$: Subject<void> = new Subject();

  constructor(private fetchData: FecthDataService,
    private holdData: HoldDataService,
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

  getCategories(){
    // get categories
    this.fetchData.getTags(this.companyId)
    .pipe(
      takeUntil(this.destroy$)
    )
    .subscribe(data => {
      this.tagsCategoriesNames = data;
      this.tagsCategories = [];
    })
  }


  getSpecificTags(category){
    this.fetchData.getSpecificTag(category.categoryId,this.companyId)
    .pipe(
      takeUntil(this.destroy$)
    )
    .subscribe(data => {
      this.tagsCategories = data;
    })
  }

  seeStatistics(category){
    //get tags from category and send them in the correct format for statistics
    this.fetchData.getSpecificTag(category.categoryId,this.companyId)
    .pipe(
      takeUntil(this.destroy$)
    )
    .subscribe(data => {
      this.tagsCategories = data;
      this.tagsCategories.forEach(tag => {
        let statisticTagFormat = {name:tag.name,value:tag.times}
        this.tagsStatistics.push(statisticTagFormat);
        this.total = tag.times + this.total
      })
      let tagsAndCategory = { array:this.tagsStatistics,category:category,total:this.total}
      let navigationExtras: NavigationExtras = {
        state: {
          statistics: tagsAndCategory
        }
      };
      this.router.navigate(['statistics'],navigationExtras);
    })
  }

  ngOnDestroy(){
    this.destroy$.next();
    this.destroy$.complete();
  }
}
