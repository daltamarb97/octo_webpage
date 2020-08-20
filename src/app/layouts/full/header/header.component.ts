import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';

import { AuthService } from '../../../core/services/auth.service';
import { SetDataService } from '../../../core/services/set-data.service';
import { HelpDialogComponent } from '../../../material-component/help-dialog/help-dialog.component';
import { HoldDataService } from '../../../core/services/hold-data.service';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: []
})
export class AppHeaderComponent {

  constructor(
    private router: Router,
    private dialog: MatDialog,
    // services
    private authService: AuthService,
    private setData: SetDataService,
    private holdData: HoldDataService,
  ){}

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
}
