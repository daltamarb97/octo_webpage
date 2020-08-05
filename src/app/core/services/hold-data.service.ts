import { Injectable } from '@angular/core';

import * as firebase from 'firebase';
import { AngularFirestore } from '@angular/fire/firestore';

@Injectable({
  providedIn: 'root'
})
export class HoldDataService {

  userInfoInRow:object; // variable used to pass data from table of payment to custom user profile in row
  userInfo:any;
  buildingInfo:any;
  userId:string;
  hideSpinner: boolean = false;
  constructor(
    private db: AngularFirestore
  ) { }


  convertJSDateIntoFirestoreTimestamp(){
    // translate js date into firestore date to be push
    const time = firebase.firestore.FieldValue.serverTimestamp();
    return time;    
  }

  createRandomId(){
    const id = this.db.createId();
    return id;
  }
}
