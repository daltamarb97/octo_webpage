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
    // get company employees
    let ref = this.db.collection('company')
    .doc(companyId)
    .collection('employees')

    return ref.stateChanges(['added']);
  }

  getWhatsappTemplates(companyId: string, customTemplates: boolean){
    // get whatsapp templates
    if (customTemplates) {
      let ref = this.db.collection('whatsapp')
      .doc(companyId)
      .collection('templates')
      .doc('templates')
  
      return ref.get();
    } else {
      let ref = this.db.collection('whatsapp')
      .doc('templates')
  
      return ref.get();
    }
  }

  getFormsFromCompany(companyId: string) {
    let ref = this.db.collection('whatsapp')
      .doc(companyId)
      .collection('forms')
    
    return ref.get();
  }

  getMainMessageForm(companyId: string, formId: string) {
    let ref = this.db.collection('whatsapp')
      .doc(companyId)
      .collection('forms')
      .doc(formId)
      .collection('content', ref => ref.where("main", "==", true))

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

  getWhatsappChatsSound(companyId){
    // getting chatrooms info
    let ref = this.db.collection('whatsapp')
    .doc(companyId)
    .collection('chats')

    return ref.stateChanges(['modified']);
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
      const api_url = "http://localhost:5000/message/check-user"
      // const api_url = (data.api_url) ? `${data.api_url}/message/check-user` : "https://octo-api-wa.herokuapp.com/message/check-user"
      const finalData = {
        companyId: data.companyId,
        number: data.number
      }
      let headers = new HttpHeaders({ 'Content-Type': 'application/JSON' });
      const req = this.httpClient.post(api_url, JSON.stringify(finalData), {headers: headers, responseType: 'text'});
      return req;
  }

  getCommentsChat(data) {
    let ref = this.db.collection('whatsapp')
    .doc(data.companyId)
    .collection('chats')
    .doc(data.number)
    .collection('comments', ref => ref.orderBy('timestamp', "asc"));

    return ref.valueChanges();
  }
  // END OF WHATSAPP

  // END OF CHATS AND COMUNICATIONS SERVICES

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
  //TAGS SERVICES
  getTags(companyId){
    // getting chatrooms info
    let ref = this.db.collection('whatsapp')
    .doc(companyId)
    .collection('tags')
    

    return ref.valueChanges();
  }
  
  getSpecificTag(categoryId, companyId){
    let ref = this.db.collection('whatsapp')
    .doc(companyId)
    .collection('tags')
    .doc(categoryId)
    .collection('tagsnames');

    return ref.valueChanges();
  }

  getTagFromConversation(chatId,companyId){
    let ref = this.db.collection('whatsapp')
    .doc(companyId)
    .collection('chats')
    .doc(chatId)
    .collection('tags')
    

    return ref.valueChanges();
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

  // BOT FLOW SERVICES

  getCompleteFlow(companyId: string){
    let ref = this.db.collection('whatsapp')
    .doc(companyId)
    .collection('flow')

    return ref.get();
  }

  getSpecificFlow(companyId: string, flowId: string){
    let ref = this.db.collection('whatsapp')
    .doc(companyId)
    .collection('flow')
    .doc(flowId)

    return ref.valueChanges();
  }

  getFlowOptions(companyId, flowId){
    let ref = this.db.collection('whatsapp')
    .doc(companyId)
    .collection('flow')
    .doc(flowId)
    .collection('options', ref => ref.orderBy('optionNumber', "asc"))

    return ref.valueChanges();
  }

  // END OF BOT FLOW SERVICES
}
