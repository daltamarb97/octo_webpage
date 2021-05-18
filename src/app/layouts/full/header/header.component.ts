import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';

import { SetDataService } from '../../../core/services/set-data.service';
import { HelpDialogComponent } from '../../../material-component/help-dialog/help-dialog.component';
import { HoldDataService } from '../../../core/services/hold-data.service';
import { Howl } from 'howler';
import { FecthDataService } from '../../../core/services/fecth-data.service';


@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: []
})
export class AppHeaderComponent implements OnInit {

  event: Event = new Event('not');
  showNot: boolean = false;
  compId: boolean = false;
  public available: boolean;
  public availableText: string;

  constructor(
    private dialog: MatDialog,
    // services
    private fetchData: FecthDataService,
    private setData: SetDataService,
    private holdData: HoldDataService,
  ){
    if (this.holdData.userInfo.companyId) {
      // this.getNewMessages();
    }
  }

  async ngOnInit() {
    await this._getUserAvailability()
  }

  private async _getUserAvailability() {
    const response = await this.fetchData.getUserInfoWeightOnce(this.holdData.companyInfo.companyId, this.holdData.userId).toPromise();
    this.available = response.data().available;
    this.availableText = this.available ? 'Disponible' : 'No Disponible';
  }

  async changeAvailability() {
    await this.setData.changeAgentAvailability(this.holdData.companyInfo.companyId, this.holdData.userId);
    this.available = !this.available;
    this.availableText = this.available ? 'Disponible' : 'No Disponible';
  }

  // getNewMessages() {
  //   this.compId = true;
  //   this.fetchData.getWhatsappChatsSound(this.holdData.companyInfo.companyId)
  //     .subscribe(data => {
  //       data.map(d => {
  //         if (this.showNot) {
  //           for (let i = 0; i < d.payload.doc.data().assignTo.length; i++) {
  //             if (d.payload.doc.data().assignTo[i].userId === this.holdData.userId) {
  //               document.documentElement.dispatchEvent(this.event);
  //               break;
  //             }
  //           }
  //         } 
  //       })
  //     })
  // }

  sendSuggestion() {
    const dialogRef = this.dialog.open(HelpDialogComponent);
    dialogRef.afterClosed().subscribe(result => {
      if (result.event !== 'close') {
        // send support message
        const data = {
          companyId: this.holdData.companyInfo.companyId,
          userId: this.holdData.userId,
          name: `${this.holdData.userInfo.name} ${this.holdData.userInfo.lastname}`,
        }
        const message: string = result.data;
        this.setData.sendSupportMessage(data, message);
      }
    })
  }

  allowSound() {
    this.showNot = true;
    const audioHowl = new Howl({
      src: ['../../../assets/images/sounds/piece-of-cake.mp3']
    });
    document.documentElement.addEventListener("not", () => {
      audioHowl.play();
    })
  }

  disallowSound() {
    this.showNot = false;
    document.documentElement.removeEventListener("not", () => {})
  }
}
