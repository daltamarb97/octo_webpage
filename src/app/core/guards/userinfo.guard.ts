import { Injectable } from '@angular/core';
import { CanActivate, RouterStateSnapshot, ActivatedRouteSnapshot} from '@angular/router';

import { HoldDataService } from '../services/hold-data.service';
import { FecthDataService } from '../services/fecth-data.service';
import { AuthService } from '../services/auth.service';

@Injectable({
  providedIn: 'root'
})
export class UserinfoGuard implements CanActivate {
  constructor(
    private holdData: HoldDataService,
    private fetchData: FecthDataService,
    private authService: AuthService,
  ) {} 
  async canActivate(
    next: ActivatedRouteSnapshot,
    state: RouterStateSnapshot): Promise<any> {
    if (!this.holdData.userId || !this.holdData.userInfo || !this.holdData.companyInfo){
      try {
        await this.getCompanyInfo()  
        return true;
      }catch (error) {
        return false;
      }
    }else {
      return true;
    }
  }

  private getData() {
    return new Promise((resolve, reject) => {
      this.authService.getCurrentUser()
      .subscribe(user => {
        if(user) {
          this.holdData.userId = user.uid; 
          resolve(this.holdData.userId); 
        }
        reject('current user not found')
      });
    })
  }

  private async getUserInfo(){
    // get user Info to be used
    const userId = await this.getData();
    return new Promise((resolve, reject) => {
      this.fetchData.getUserInfo(userId)
        .subscribe(user=>{
          if(user) {
            // assign userInfo value to global variable
            this.holdData.userInfo = user;
            resolve(this.holdData.userInfo)
          }
          reject('userInfo not found')
      })
    })
  }

  private async getCompanyInfo(){
    const userInfo:any = await this.getUserInfo();
    return new Promise((resolve, reject) => {
      if(!userInfo.companyId) {
        this.holdData.hideSpinner = true;
        return resolve('no company')
      }
      // get company Info to be used
      this.fetchData.getCompanyInfo(userInfo.companyId)
      .subscribe(company => {
        if(company) {
          // assign companyInfo value to global variable
          this.holdData.companyInfo = company;  
          this.holdData.hideSpinner = true; 
          resolve(this.holdData.companyInfo);
        } 
        reject('Internal server error');
      })
    })
  }
}
