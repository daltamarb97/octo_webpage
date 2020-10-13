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
  notsAllowed: boolean = false;
  notTotal: any;
  notSaw: number = 0;
  view: any[] = [1000, 300];
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
    ) { }

  async ngOnInit() {
    if (!this.holdData.companyInfo) {
      this.router.navigate(['no-comp'])
    }
    this.companyId = this.holdData.userInfo.companyId;
    const notAllowed =  await this.fetchData.getBalanceCompanyInfo(this.companyId).toPromise();
    if (notAllowed.data().notifications) {
      this.notsAllowed = true;
      this.notTotal = await this.fetchData.getNotifications(this.companyId).toPromise();
    }
    this.getCategories();
  }

  getCategories(){
    // get categories
    this.fetchData.getTags(this.companyId)
    .pipe(
      takeUntil(this.destroy$)
    )
    .subscribe(data => {
      data.forEach(d => {
        if (d.categoryId) this.tagsCategoriesNames.push(d);
      })
      this.tagsCategories = [];
    })
  }


  getSpecificTags(category){
    this.fetchData.getSpecificTag(category.categoryId,this.companyId)
    .pipe(
      takeUntil(this.destroy$)
    )
    .subscribe(data => {
      // this.tagsCategories = data.map(d => d)      
      this.tagsCategories = data;
    })
  }

  async seeStatistics(category){
    if (category !== 'notifications') {
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
    } else {
      this.notTotal.forEach(d => {
        if(d.data().status === 'read') {
          this.notSaw++;
        }
      })
      let navigationExtras: NavigationExtras = {
        state: {
          data: {
            saw: this.notSaw, 
            sent: this.notTotal.docs.length
          },
          category: 'notifications'
        }
      };
      this.router.navigate(['statistics'],navigationExtras);
    }
  }

  ngOnDestroy(){
    this.destroy$.next();
    this.destroy$.complete();
  }
}
