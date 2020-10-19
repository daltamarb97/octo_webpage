import { Injectable } from '@angular/core';
import { AngularFirestore } from '@angular/fire/firestore';

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

    return ref.delete()
  }

  // END PAYMENTS TABLE SERVICES

  // --*--*--*--*--*--*--*--*--*--*--*--*--*--*--*--*--*--*--*
  // WhatsApp SERVICES
  private async deleteTag(companyId, number,tagId){
    // delete single specific row of payments table
    let ref = this.db.collection('whatsapp')
    .doc(companyId)
    .collection('chats')
    .doc(number)
    .collection('tags')
    .doc(tagId)
    return ref.delete();
  }
  deletePersonAssigned(companyId, chatId){
    let ref = this.db.collection('whatsapp')
    .doc(companyId)
    .collection('chats')
    .doc(chatId)
    
    
    return ref.delete();
      
  }
  deleteTagCounter(companyId, categoryId, tagId, number){
    let refCounter = this.db.collection('whatsapp')
    .doc(companyId)
    .collection('tags')
    .doc(categoryId)
    .collection('tagsnames')
    .doc(tagId);
    return refCounter.get()
      .subscribe(async data => {
        await this.deleteTag(companyId,number, tagId);
        await refCounter.update({times: data.data().times-1})
      })
  }


  deleteTagFromCompany(companyId, categoryId,tagId){
    // delete single specific row of payments table
    let ref = this.db.collection('whatsapp')
    .doc(companyId)
    .collection('tags')
    .doc(categoryId)
    .collection('tagsnames')
    .doc(tagId)

    return ref.delete()
  }
  deleteCategory(companyId, categoryId){
    // delete single specific row of payments table
    let ref = this.db.collection('whatsapp')
    .doc(companyId)
    .collection('tags')
    .doc(categoryId)
    

    return ref.delete()
  }
  // END WhatsApp SERVICES

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

    return ref.delete()
  }


// END OF COMUNICATIONS AND CHAT

// --*--*--*--*--*--*--*--*--*--*--*--*--*--*--*

// WHATSAPP SERVICES

async deleteFlow(data) {
  let ref = this.db.collection('whatsapp')
    .doc(data.companyId)
    .collection('flow')
    .doc(data.flowId)
  
    try{
      if(!data.parentFlow) {
        // delete all flow collection because main was deleted
        this.db.collection('whatsapp')
          .doc(data.companyId)
          .collection('flow')
          .get()
          .subscribe(dataRta => {
            dataRta.forEach(async(d) => {
              await this.db.collection('whatsapp')
              .doc(data.companyId)
              .collection('flow')
              .doc(d.id)
              .delete();
            })
          })
          return;
      } else {
        await ref.delete();
        let refParent = this.db.collection('whatsapp')
          .doc(data.companyId)
          .collection('flow')
          .doc(data.parentFlow)
          .collection('options', refParent => refParent.where("redirectTo", "==", data.flowId))
          .get();
        refParent.toPromise().then(rta => {
          rta.forEach(async (flow) => {
            await this.db.collection('whatsapp')
            .doc(data.companyId)
            .collection('flow')
            .doc(data.parentFlow)
            .collection('options')
            .doc(flow.id)
            .delete();
          })
        })
        return;
      }
    }catch(error) {
      return new Error(error)
    }
}
// WHATSAPP SERVICES

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
