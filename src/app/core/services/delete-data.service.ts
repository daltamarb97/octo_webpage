import { Injectable } from '@angular/core';
import { AngularFirestore } from '@angular/fire/firestore';
import * as firebase from 'firebase';

@Injectable({
  providedIn: 'root'
})
export class DeleteDataService {

  constructor(private db: AngularFirestore) { }

  // PAYMENTS TABLE SERVICES

  deleteSingleTableRow(buildingId, rowId){
    // delete single specific row of payments table
    let ref = this.db.collection('payment_tables/')
    .doc(buildingId)
    .collection('rows_data')
    .doc(rowId)

    return ref.delete().then(()=>{
      console.log('removed successfully');
    })
  }


  deletePullRequestPaymentProof(data){
    // delete image and pullRequest of payment proof
    let ref = firebase.storage().ref(`paymentRecords/${data.buildingId}`).child(`${data.rowId}`);
    ref.delete()
      .then(async () => {
        // set false pullRequest instance
        let refRecord = this.db.collection('payments_records')
        .doc(`${data.rowId}`)
        .collection('record_of_payments')
        .doc(`${data.paymentId}`)

        let refRow = this.db.collection('payment_tables')
        .doc(`${data.buildingId}`)
        .collection('rows_data')
        .doc(`${data.rowId}`)

        if (data.action) {
          await refRecord.update({
            pullRequest: false
          });
  
          refRow.get()
            .subscribe(dataRow => {
              const pendingToPay = dataRow.data().pending_to_pay;
              refRow.update({
                pullRequest: false,
                pending_to_pay: pendingToPay - data.paid_amount
              })
            })   
        }else if (data.action === false) {
          await refRecord.delete();
  
          await refRow.update({
            pullRequest: false
          });
        }
        

        console.log('pullRequest resolved');
      })
      .catch(e => console.error(`error deleting image: ${e}`))
  }

  // END PAYMENTS TABLE SERVICES

  // --*--*--*--*--*--*--*--*--*--*--*--*--*--*--*--*--*--*--*

  // COMUNICATIONS AND CHAT

  deleteChatRoom(buildingId, roomId, userId){
    // delete chat room in chats collection
    let ref  = this.db.collection('chats')
    .doc(buildingId)
    .collection('rooms')
    .doc(roomId)

    return ref.delete().then(()=>{
      // remove chat room info from user collection
      this.deleteChatRoomFromUser(userId, roomId);
    })
  }


  private deleteChatRoomFromUser(userId, roomId){
    // remove chat room info from user collection
    let ref = this.db.collection('users')
    .doc(userId)
    .collection('chatRooms')
    .doc(roomId)

    return ref.delete().then(()=>{
      console.log(' chat removed successfully');
    })
  }


// END OF COMUNICATIONS AND CHAT

// --*--*--*--*--*--*--*--*--*--*--*--*--*--*--*

// TASK SERVICES

  deleteTask(companyId:string, taskId:string){
    // update body or title of the announcement
    let ref = this.db.collection('board')
    .doc(companyId)
    .collection('tasks')
    .doc(taskId)

    return ref.delete()
    .then(()=>{
      console.log('announcement deleted');
    }).catch(err => {
      console.log('an error happened: ' +err);
    });
  }

  deleteFileOfTask(companyId: string, taskId: string, fileId: string) {
    const storage = firebase.storage();
    let ref =  storage.ref(`/tasks/${companyId}/${taskId}/${fileId}`);
    return ref.delete();
  }
// END OF TASK SERVICES

// --*--*--*--*--*--*--*--*--*--*--*--*--*--*--*

// PROFILE SERVICES

disableDoormanAccountFromDB(buildingId:string, doormanId:string){
  // disable doorman account from DB , but it is not deleted from Auth
  // inside collection building it is actually deleted
  let refBuilding = this.db.collection('buildings')
  .doc(buildingId)
  .collection('employees')
  .doc(doormanId)

  let refUsers = this.db.collection('users')
  .doc(doormanId)

  return refBuilding.delete()
  .then(()=>{
    refUsers.update({
      disabled: true
    }).then(()=>{
      console.log('doorman disabled')
    })
  })
}


// END OF PROFILE SERVICES

// --*--*--*--*--*--*--*--*--*--*--*--*--*--*--*

// SINGUP SERVICES

deleteInviteAfterSignup(inviteId: any) {
  // delete invite if found one
  let ref = this.db.collection('invites')
  .doc(inviteId)

  return ref.delete();
}

// END OF SIGNUP SERVICES

}
