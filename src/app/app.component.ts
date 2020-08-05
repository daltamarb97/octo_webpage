import { Component } from '@angular/core';

// services
import { FecthDataService } from './core/services/fecth-data.service';
import { AuthService } from './core/services/auth.service';
import { HoldDataService } from './core/services/hold-data.service';


@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  constructor(
    // services
    private fetchData: FecthDataService,
    private authService: AuthService,
    private holdData: HoldDataService
  ){

    this.authService.getCurrentUser()
      .subscribe(user => {
        this.holdData.userId = user.uid; 
        this.getUserInfo();  
      });
  }


  private getUserInfo(){
    // get user Info to be used
    this.fetchData.getUserInfo(this.holdData.userId)
    .subscribe(user=>{
      // assign userInfo value to global variable
      this.holdData.userInfo = user;
      this.getBuildingInfo();
    })
  }


  private getBuildingInfo(){
    // get building Info to be used
    this.fetchData.getBuildingInfo(this.holdData.userInfo.buildingId)
    .subscribe(building => {
      // assign buildinginfo value to global variable
      this.holdData.buildingInfo = building;  
      this.holdData.hideSpinner = true; 
      console.log('app component salio')  
    })
  }
}
