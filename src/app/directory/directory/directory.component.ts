import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

import { FecthDataService } from '../../core/services/fecth-data.service';
import { HoldDataService } from '../../core/services/hold-data.service';
import { SetDataService } from '../../core/services/set-data.service';

@Component({
  selector: 'app-directory',
  templateUrl: './directory.component.html',
  styleUrls: ['./directory.component.scss']
})
export class DirectoryComponent implements OnInit {
  user:any;
  residents :Array<any> = [];
  emergency :Array<any> = [];
  others :Array<any> = [];
  keyChats:any;
  buildingInfo: any;

  constructor(
    private fecthDataService:FecthDataService,
    private setData: SetDataService,
    private holdData:HoldDataService,
    private router: Router,
    ) {}

  ngOnInit(): void {
    this.user= this.holdData.userInfo;
    this.buildingInfo = this.holdData.buildingInfo;
    this.getInfoDirectoryEmergency();
    this.getInfoDirectoryOthers();
    this.getInfoDirectoryResidents();
  }

  private getInfoDirectoryResidents() {
    this.fecthDataService.getDirectory(this.user.buildingId, 'residents')
      .subscribe( res => {
        res.map(r => {
          const data = r.payload.doc.data();
          this.residents.push(data);
        })
      });
  }

  private getInfoDirectoryEmergency() {
    this.fecthDataService.getDirectory(this.user.buildingId, 'emergency')
      .subscribe( res => {
        res.map(r => {
          const data = r.payload.doc.data();
          this.emergency.push(data);
        })
      });
  }

  private getInfoDirectoryOthers() {
    this.fecthDataService.getDirectory(this.user.buildingId, 'others')
      .subscribe( res => {
        res.map(r => {
          const data = r.payload.doc.data();
          this.others.push(data);
        })
      });
  }

  
  chat(person){  
    // verifying the user already have a conversation with the person
   this.fecthDataService.getPrivateChatKey(this.user.userId,person.userId)
    .subscribe( res => {
      if (res.data()) {
        this.router.navigate(['/canales-comunicacion']);
      } else {
        const localData = {
          userId: this.user.userId,
          name: this.user.name,
          lastname: this.user.lastname,
        }
        const foreignData = {
          userId: person.userId,
          name: person.name,
          lastname: person.lastname,
        }
        this.setData.createPrivateChat(localData, foreignData)
          .then(() => {
            this.router.navigate(['/canales-comunicacion']);
          })
      }
    });
 }
}
