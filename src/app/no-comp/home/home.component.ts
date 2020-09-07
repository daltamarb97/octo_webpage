import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';

import { HoldDataService } from '../../core/services/hold-data.service';
import { SetDataService } from '../../core/services/set-data.service';
import { FecthDataService } from '../../core/services/fecth-data.service';
import { DeleteDataService } from '../../core/services/delete-data.service';
import { MessagingService } from '../../core/services/messaging.service';


@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit {
  companyName: string;
  inviteCode: string;
  codeError: boolean = false;
  errorMessage: string;
  spinner: boolean = false;
  constructor(
    private holdData: HoldDataService,
    private setData: SetDataService,
    private fetchData: FecthDataService,
    private deleteData: DeleteDataService,
    private messagingService: MessagingService,
    // angular
    private router: Router,
    private route: ActivatedRoute,
  ) { 
    this.route.queryParams.subscribe(() => {
      if (this.router.getCurrentNavigation().extras.state) {
        const currentNav = this.router.getCurrentNavigation().extras.state
        if (currentNav.new) {
        } else {
          if (this.holdData.companyInfo) {
            this.router.navigate(['whatsapp']);
          }
        }
      } else{
        if (this.holdData.companyInfo) {
          this.router.navigate(['whatsapp']);
        }
      }
    });
  }

  ngOnInit(): void {
     this.messagingService.getPermissions();
  }

  createCompany() {
    // creates company
    this.codeError = false; 
    this.spinner = true;
    this.setData.setNewCompany({name: this.companyName}, this.holdData.userInfo)
      .then(() => {
        this.spinner = false;
        this.router.navigate(['whatsapp']);
      })
  }

  userInvite() {
    // creates user by invite
    this.codeError = false;
    this.spinner = true;
    this.checkInviteCode()
      .then(data => {
        this.setData.setUserInfoInCompany(this.holdData.userInfo, data)
          .then(() => {
            this.spinner = false;
            this.router.navigate(['whatsapp']);
          })
      })
      .catch(error => {
        this.spinner = false;
        this.codeError = true;
        this.errorMessage = error;
      })
  }

  private checkInviteCode() {
    // check if invite code exists
    return new Promise((resolve, reject) => {
      this.fetchData.getInviteCodes()
      .subscribe(data => {
        const rta = data.docs.map(d => d.data());
        for (let i in rta) {
          if (rta[i].inviteId === this.inviteCode && rta[i].guestEmail === this.holdData.userInfo.email) {
            // delete invite if found one
            this.deleteData.deleteInviteAfterSignup(rta[i].inviteId);
            resolve({companyId: rta[i].companyId, name: rta[i].company});
            break;
          }
        }
        reject('No se ha encontrado código de invitación asociado a tu email')
      })
    })
  }
}
