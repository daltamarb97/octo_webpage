import { Injectable } from '@angular/core';
import { AngularFirestore } from '@angular/fire/firestore';
import * as firebase from 'firebase';

@Injectable({
  providedIn: 'root'
})
export class FecthDataService {

  constructor(
    private db: AngularFirestore,
  ) {
    
   }


   getUserInfo(userId){
    // get user profile info
    let ref = this.db.collection('users')
    .doc(userId)

    return ref.valueChanges();
  }


  // BUIDLING SERVICES

  getBuildingInfo(buildingId){
    // get building info
    let ref = this.db.collection('buildings')
    .doc(buildingId)

    return ref.valueChanges();
  }


  getBuidlingResidents(buildingId){
    // get building residents
    let ref = this.db.collection('buildings')
    .doc(buildingId)
    .collection('residents')

    return ref.stateChanges(['added']);
  }


  getBuidlingEmployees(buildingId){
    // get building employees (use in profile) 
    let ref = this.db.collection('buildings')
    .doc(buildingId)
    .collection('employees')
    
    return ref.stateChanges(['added']);
  }

  getCompanyPasswords() {
    // retreive all company pass
    let ref = this.db.collection('company')
    .doc('companyPasswords')
    .collection('references')

    return ref.get();
  }

  // END BUIDLING SERVICES

  // --*--*--*--*--*--*--*--*--*--*--*--*--*--*--*--*--*--*--*

  // PAYMENT TABLE SERVICES

  getTableData(buildingId){
     // get payment table's data 
    return this.db.collection('payment_tables')
    .doc(buildingId)
    .collection('rows_data')
    .valueChanges();
  }


  getColumnNames(){
    // get metadata of table payments
    let ref = this.db.collection('payments_metadata')
    .doc('col_names')

    return ref.get();
  }


  getSingleUserPaymentRecords(rowId){
    // get payment record of specific row in user detail's view after click on admin's table of payments
    let ref = this.db.collection('payments_records')
    .doc(rowId)
    .collection('record_of_payments')

    return ref.valueChanges();
  }

  async getPaymentProofImage(data){
    // get payment proof image form storage firebase
    let ref = firebase.storage().ref(`paymentRecords/${data.buildingId}`).child(`${data.rowId}`);
    const url = await ref.getDownloadURL();
    return url;
  }

  // END OF PAYMENT TABLE SERVICES

  // --*--*--*--*--*--*--*--*--*--*--*--*--*--*--*

  // CHATS AND COMUNICATIONS SERVICES

  getChatRooms(userId){
    // getting chatrooms info
    let ref = this.db.collection('users')
    .doc(userId)
    .collection('chatRooms')

    return ref.stateChanges(['added', 'removed']);
  }

  
  getPrivateChats(userId){
    // getting chatrooms info
    let ref = this.db.collection('users')
    .doc(userId)
    .collection('keyChats')

    return ref.stateChanges(['added', 'removed']);
  }

  getMessagesFromSpecificRoom(buildingId: string, roomId: string, timestamp, limit: number){
    // get messages from specific room
    let ref = this.db.collection('chats')
    .doc(buildingId)
    .collection('rooms')
    .doc(roomId)
    .collection('messages', ref => ref.orderBy('timestamp', "desc").where("timestamp", "<", timestamp).limit(limit))

    return ref.stateChanges(['added']);
  }


  getSpecificChat(chatId: string, timestamp, limit: number){
    // get messages from specific room
    let ref = this.db.collection('privatechat')
    .doc(chatId)
    .collection('messages', ref => ref.orderBy('timestamp', "desc").where("timestamp", "<", timestamp).limit(limit))

    return ref.stateChanges(['added']);
  }

  getParticipantsFromSpecificRoom(buildingId, roomId){
    // get messages from specific room
    let ref = this.db.collection('chats')
    .doc(buildingId)
    .collection('rooms')
    .doc(roomId)
    .collection('participants')

    return ref.stateChanges(['added']);
  }

  getPrivateMessageKeys(userId:string){
    let ref = this.db.collection('users')
    .doc(userId)
    .collection('keyChats')

    return ref.get();
  }

  getDefaultChats (companyId: string) {
    let ref = this.db.collection('chats')
    .doc(companyId)
    .collection('rooms');

    return ref.get();
  }

  // END OF CHATS AND COMUNICATIONS SERVICES

  // --*--*--*--*--*--*--*--*--*--*--*--*--*--*--*

  // BOARD SERVICES
    
  getBoardAnnouncements(buildingId){
    // get all the announcements for a building
    let ref = this.db.collection('board')
    .doc(buildingId)
    .collection('announcements', ref => ref.orderBy('timestamp', 'desc'))
    
    return ref.valueChanges();
  }

  // END OF BOARD SERVICES

  // --*--*--*--*--*--*--*--*--*--*--*--*--*--*--*

   // DIRECTORY SERVICES
 
   getPrivateChatKey(userId,receiverId){
    let ref = this.db.collection('users')
    .doc(userId)
    .collection('keyChats')
    .doc(receiverId)

    return  ref.get();
  }


    getDirectory(buildingId: string, type: string){
      let ref =  this.db.collection('buildings')
      .doc(buildingId)
      .collection(type)
      
      return ref.stateChanges(['added']); 
  }
   // END OF DIRECTORY SERVICES

}
