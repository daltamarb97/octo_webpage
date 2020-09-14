import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Subject } from 'rxjs';

@Component({
  selector: 'app-statistics',
  templateUrl: './statistics.component.html',
  styleUrls: ['./statistics.component.css']
})
export class StatisticsComponent implements OnInit {
  tagsArray:Array<any> = [];
  tagsStatistics:Array<any> = [];
  info:any;
  category:any;
  view: any[] = [1000, 300];
  saleData:any =[];
  // options
  gradient: boolean = true;
  showLegend: boolean = true;
  showLabels: boolean = true;
  isDoughnut: boolean = false;
  transferenceArray:any =[];
  colorScheme = {
    domain: ['#5AA454', '#A10A28', '#C7B42C', '#AAAAAA']
  };
  destroy$: Subject<void> = new Subject();

  total:any = 0;
  constructor(private router: Router,
    private route: ActivatedRoute,) {
      //getting params from navigation
      this.route.queryParams.subscribe(() => {
        if (this.router.getCurrentNavigation().extras.state) {
          this.info = this.router.getCurrentNavigation().extras.state.statistics;
          this.total = this.info.total
          this.tagsStatistics = this.info.array;
          this.category = this.info.category;
          this.tagsStatistics.forEach(tag=>{
            tag.value = (tag.value/this.info.total)*100                  
          })
        }
        
          
      });
     }
  ngOnInit(): void { 
  }
}
