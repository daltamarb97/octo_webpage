import { Injectable } from '@angular/core';
import { AngularFirestore } from '@angular/fire/firestore';
import { HttpClient, HttpHeaders } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class FecthDataService {

  constructor(
    private db: AngularFirestore,
    private httpClient: HttpClient,
  ) {}


   getUserInfo(userId){
    // get user profile info
    let ref = this.db.collection('users')
    .doc(userId)

    return ref.valueChanges();
  }


  // COMPANY SERVICES

  getCompanyInfo(companyId: string){
    // get building info
    let ref = this.db.collection('company')
    .doc(companyId)

    return ref.valueChanges();
  }


  getCompanyEmployees(companyId: string){
    // get building residents
    let ref = this.db.collection('company')
    .doc(companyId)
    .collection('employees')

    return ref.stateChanges(['added']);
  }

  getWhatsappTemplates(){
    // get building residents
    let ref = this.db.collection('whatsapp')
    .doc('templates')

    return ref.get();
  }

  getInviteCodes() {
    // retreive all company pass
    let ref = this.db.collection('invites')

    return ref.get();
  }

  getProyects(userId: string) {
    let ref = this.db.collection('users')
    .doc(userId)
    .collection('companies')
    
    return ref.get();
  }

  // END COMPANY SERVICES

  // --*--*--*--*--*--*--*--*--*--*--*--*--*--*--*--*--*--*--*

  // CHATS AND COMUNICATIONS SERVICES

  getChatRooms(userId, companyId){
    // getting chatrooms info
    let ref = this.db.collection('users')
    .doc(userId)
    .collection('chatRooms')
    .doc(companyId)
    .collection('rooms');

    return ref.stateChanges(['added', 'removed']);
  }

  
  getPrivateChats(userId, companyId){
    // getting chatrooms info
    let ref = this.db.collection('users')
    .doc(userId)
    .collection('keyChats')
    .doc(companyId)
    .collection('chats')

    return ref.stateChanges(['added', 'removed']);
  }

  getMessagesFromSpecificRoom(companyId: string, roomId: string, timestamp, limit: number){
    // get messages from specific room
    let ref = this.db.collection('chats')
    .doc(companyId)
    .collection('rooms')
    .doc(roomId)
    .collection('messages', ref => ref.orderBy('timestamp', "desc").where("timestamp", "<", timestamp).limit(limit))

    return ref.get();
  }

  getMessagesFromSpecificRoomOnView(companyId: string, roomId: string){
    // get messages from specific room on view (realtime)
    let ref = this.db.collection('chats')
    .doc(companyId)
    .collection('rooms')
    .doc(roomId)
    .collection('messages', ref => ref.orderBy('timestamp', 'desc').limit(20))

    return ref.stateChanges(['added']);
  }


  getMessagesFromSpecificRoomPrivateOnView(chatId: string ){
    // get messages from specific room on view (realtime)
    let ref = this.db.collection('privatechat')
    .doc(chatId)
    .collection('messages', ref => ref.orderBy('timestamp', "desc").limit(20))

    return ref.stateChanges(['added']);
  }

  getSpecificChat(chatId: string, timestamp, limit: number){
    // get messages from specific room
    let ref = this.db.collection('privatechat')
    .doc(chatId)
    .collection('messages', ref => ref.orderBy('timestamp', "desc").where("timestamp", "<", timestamp).limit(limit))

    return ref.get();
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

  getWhatsappQuota(companyId: string) {
    let ref = this.db.collection('company')
    .doc(companyId)
    .collection('quotas')
    .doc('whatsapp')

    return ref.valueChanges();
  }


  // WHATSAPP

  getWhatsappChats(companyId){
    // getting chatrooms info
    let ref = this.db.collection('whatsapp')
    .doc(companyId)
    .collection('chats')

    return ref.valueChanges();
  }

  getMessagesFromSpecificWChat(companyId: string, phoneNumber: string){
    // get messages from specific whatsapp chat
    let ref = this.db.collection('whatsapp')
    .doc(companyId)
    .collection('chats')
    .doc(phoneNumber)
    .collection('messages', ref => ref.orderBy('timestamp', 'desc'))

    return ref.stateChanges(['added']);
  }


  checkWhatsapp24HourWindow(data) {
      const api_url = "https://octo-api-wa.herokuapp.com/message/check-user"
      const finalData = {
        companyId: data.companyId,
        number: data.number
      }
      let headers = new HttpHeaders({ 'Content-Type': 'application/JSON' });
      const req = this.httpClient.post(api_url, JSON.stringify(finalData), {headers: headers, responseType: 'text'});
      return req;
  }

  // END OF WHATSAPP

  // END OF CHATS AND COMUNICATIONS SERVICES

  // --*--*--*--*--*--*--*--*--*--*--*--*--*--*--*

  // TASK SERVICES
    
  getCompanyTasks(companyId){
    // get all the announcements for a building
    let ref = this.db.collection('board')
    .doc(companyId)
    .collection('tasks', ref => ref.orderBy('timestamp', 'desc'))
    
    return ref.stateChanges(['added', 'removed', 'modified']);
  }

  // async getFileFromTask(data){
  //   // get file from specific task
  //   let rta = {
  //     contentType: '',
  //     url: '',
  //   };
  //   const storage = firebase.storage();
  //   let ref =  storage.ref(`/tasks/${data.companyId}/${data.taskId}/${data.fileId}`);
  //   const metadata = await ref.getMetadata();
  //   const url = await ref.getDownloadURL();
  //   if (metadata.contentType.includes('image')) {
  //     rta = {
  //       contentType: 'image',
  //       url: url,
  //     }
  //   } else{
  //     rta = {
  //       contentType: 'file',
  //       url: url,
  //     }
  //   }
  //   return rta;
  // }

  // async getFileFromComment(data){
  //   // get file from specific task
  //   let rta = {
  //     contentType: '',
  //     url: '',
  //   };
  //   const storage = firebase.storage();
  //   let ref =  storage.ref(`/tasks/${data.companyId}/${data.taskId}/comments/${data.commentId}/${data.fileId}`);
  //   const metadata = await ref.getMetadata();
  //   const url = await ref.getDownloadURL();
  //   if (metadata.contentType.includes('image')) {
  //     rta = {
  //       contentType: 'image',
  //       url: url,
  //     }
  //   } else{
  //     rta = {
  //       contentType: 'file',
  //       url: url,
  //     }
  //   }
  //   return rta;
  // }

  getComments(companyId,taskId){
    // get all the announcements for a building
    let ref = this.db.collection('board')
    .doc(companyId)
    .collection('tasks')
    .doc(taskId)
    .collection('comments', ref => ref.orderBy('timestamp'))
    
    return ref.stateChanges(['added']);
  }

  // END OF TASK SERVICES
 
  // END OF BOARD SERVICES

  // --*--*--*--*--*--*--*--*--*--*--*--*--*--*--*

   // DIRECTORY SERVICES
 
   getPrivateChatKey(userId,receiverId, companyId){
    let ref = this.db.collection('users')
    .doc(userId)
    .collection('keyChats')
    .doc(companyId)
    .collection('chats')
    .doc(receiverId)

    return  ref.get();
  }

  // PAYMENTS

  getPaymentPlans() {
    let ref = this.db.collection('paymentData')
    .doc('plans')
    .collection('types')
    
    return ref.get();
  }

  getBalanceCompanyInfo(companyId: string) {
    let ref = this.db.collection('paymentData')
    .doc(companyId)
    
    return ref.get();
  }

}
