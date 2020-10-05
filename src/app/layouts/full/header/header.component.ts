import { Component } from '@angular/core';
import { Router } from '@angular/router';
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
export class AppHeaderComponent {

  event: Event = new Event('not');
  showNot: boolean = false;

  constructor(
    private router: Router,
    private dialog: MatDialog,
    // services
    private fetchData: FecthDataService,
    private setData: SetDataService,
    private holdData: HoldDataService,
  ){
    this.getNewMessages();
  }

  getNewMessages() {
    this.fetchData.getWhatsappChatsSound(this.holdData.companyInfo.companyId)
      .subscribe(data => {
        data.map(d => {
          if (this.showNot) document.documentElement.dispatchEvent(this.event);
        })
      })
  }

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
