import { Injectable } from '@angular/core';
import { AngularFirestore } from '@angular/fire/firestore';
import * as firebase from 'firebase/app';
import { HoldDataService } from './hold-data.service';

@Injectable({
  providedIn: 'root'
})
export class MessagingService {

  messaging = firebase.messaging();
  constructor(
    private holdData: HoldDataService,
    private angularFirestore: AngularFirestore
  ) { 

  }

  private updateToken (token) {
    let ref = this.angularFirestore.collection('users')
    .doc(this.holdData.userId)

    return ref.update({
      token: token
    })
  }

  getPermissions() {
    this.messaging.requestPermission()
      .then(async () => {
        const token = await this.messaging.getToken();
        this.updateToken(token);
      })
      .catch(e => {
        console.error('unable to get permissions', e);
      })
  }

}
