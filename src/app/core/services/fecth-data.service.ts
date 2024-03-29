import { Injectable } from '@angular/core';
import { AngularFirestore, DocumentData } from '@angular/fire/firestore';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { HoldDataService } from './hold-data.service';
import { Observable } from 'rxjs';
import { order } from '../../../interfaces/orders';

@Injectable({
  providedIn: 'root'
})
export class FecthDataService {

  constructor(
    private db: AngularFirestore,
    private httpClient: HttpClient,
    private holdData: HoldDataService,
  ) {}


   getUserInfo(userId){
    // get user profile info
    let ref = this.db.collection('users')
    .doc(userId)

    return ref.valueChanges();
  }

  getUserInfoWeightOnce(companyId: string, userId: string){
    // get user profile info
    let ref = this.db.collection('whatsapp')
      .doc(companyId)
      .collection('weights')
      .doc(userId)
    return ref.get();
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
    let ref = this.db.collection('whatsapp')
    .doc(companyId)
    .collection('weights')

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
  getTicket(companyId,ticketId){
    let ref = this.db.collection('tickets')
    .doc(companyId)
    .collection('tickets')
    .doc(ticketId)

    return ref.get();
  }

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
    .collection('messages', ref => ref.orderBy('timestamp', "desc")
    .where("timestamp", "<", timestamp).limit(limit))

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

  getWhatsappChats(companyId: string, timestampStart: any, timestampEnd: any){
    // getting chatrooms info
    let ref = this.db.collection('whatsapp')
    .doc(companyId)
    .collection('chats', ref => ref.orderBy('timestamp', 'desc')
    .where("timestamp", ">=", timestampStart)
    .where("timestamp", "<=", timestampEnd)
    .where("finished", "==", false))

    return ref.stateChanges(['added', 'modified']);
  }
 
  getWhatsappClosedChats(companyId: string, timestampStart: any, timestampEnd: any){
    
    // getting chatrooms info
    let ref = this.db.collection('whatsapp')
    .doc(companyId)
    .collection('chats', ref => ref.orderBy('timestamp', 'desc')
    .where("timestamp", ">=", timestampStart)
    .where("timestamp", "<=", timestampEnd)
    .where("finished", "==", true)
    .limit(200))

    return ref.valueChanges();
  }

  getSingleWhatsappChat(companyId: string, number: string){
    // getting chatrooms info
    let ref = this.db.collection('whatsapp')
    .doc(companyId)
    .collection('chats')
    .doc(number)

    return ref.get();
  }

  getWhatsappChatsSound(companyId){
    // getting chatrooms info
    let ref = this.db.collection('whatsapp')
    .doc(companyId)
    .collection('chats')

    return ref.stateChanges(['modified']);
  }

  getMessagesFromSpecificWChat(companyId: string, number: string){
    // get messages from specific whatsapp chat
    let ref = this.db.collection('whatsapp')
    .doc(companyId)
    .collection('chats')
    .doc(number)
    .collection('messages', ref => ref.orderBy('timestamp', 'desc'))

    return ref.stateChanges(['added']);
  }

  getMessagesFromSpecificDeliveryChat(companyId: string, orderId: string){
    // get messages from specific whatsapp chat
    let ref = this.db.collection('delivery')
    .doc(companyId)
    .collection('orders')
    .doc(orderId)
    .collection('messages', ref => ref.orderBy('timestamp', 'asc'))

    return ref.stateChanges(['added']);
  }


  checkWhatsapp24HourWindow(data) {
      // const api_url = "http://localhost:5001/message/check-user"
      const api_url = (data.api_url) ? `${data.api_url}/message/check-user` : "https://octo-api-wa.herokuapp.com/message/check-user"
      const finalData = {
        companyId: data.companyId,
        number: data.number
      }
      let headers = new HttpHeaders({ 'Content-Type': 'application/JSON' });
      const req = this.httpClient.post(api_url, JSON.stringify(finalData), {headers: headers, responseType: 'text'});
      return req;
  }

  getCommentsChat(data) {
    let ref = this.db.collection('tickets')
    .doc(data.companyId)
    .collection('tickets')
    .doc(data.ticketId)
    .collection('comments', ref => ref.orderBy('timestamp', "asc"));

    return ref.valueChanges();
  }

  getQuickResponses(companyId: string) {
    let ref = this.db.collection('whatsapp')
    .doc(companyId)
    .collection('quickResponses')
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

  getNotifications(companyId: string) {
    let ref = this.db.collection('notifications', ref => ref.where("companyId", "==", companyId));
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

  // FORMS SERVICES

  async getFormsInfo(companyId: string) {
    let response: Array<any> = [];
    let ref = await this.db.collection('whatsapp')
    .doc(companyId)
    .collection('forms')
    .get()
    .toPromise();
    ref.forEach(f => {
      response.push(f.data())
    })
    return response;
  }

  async getFormCols(companyId: string, formData: any) {
    if (formData.foreign) {
      let response = [];
      let ref = await this.db.collection('whatsapp')
      .doc(companyId)
      .collection('forms')
      .doc(formData.formId)
      .get()
      .toPromise()
      const rta: Object = ref.data().template;
      Object.keys(rta).forEach(k => {
        response.push(k)
      });
      return response;
    } else {
      interface column {
        alias: string,
        order: number,
        message: string
      }
      let response: Array<column> = [];
      let ref = await this.db.collection('whatsapp')
      .doc(companyId)
      .collection('forms')
      .doc(formData.formId)
      .collection('content')
      .get()
      .toPromise()
      ref.forEach(c => {
        if(!c.data().end) {
          const data = {
            alias: c.data().alias,
            order: c.data().order,
            message: c.data().message
          }
          response.push(data);
        }
      })
      return response;
    }
  }

  async getSingleFormInfo(companyId: string, formData: any) {
      let ref = await this.db.collection('whatsapp')
      .doc(companyId)
      .collection('forms')
      .doc(formData.formId)
      .collection('content', ref => ref.orderBy('order', "asc"))
      .get()
      .toPromise();
      return ref;
  }

  getResultsForms(companyId: string, formData: any) {
      let ref =  this.db.collection('whatsapp')
      .doc(companyId)
      .collection('forms')
      .doc(formData.formId)
      .collection('responses')
      .valueChanges();
      return ref;
  }

  async getSingleResultForms(companyId: string, formData: any) {
    let ref =  this.db.collection('whatsapp')
    .doc(companyId)
    .collection('forms')
    .doc(formData.formId)
    .collection('responses')
    .doc(formData.responseId);

    const rta = await ref.get().toPromise();
    return rta.data();
}

  getResultsFormsWithDate(companyId: string, formData: any, date: any) {
    let ref =  this.db.collection('whatsapp')
    .doc(companyId)
    .collection('forms')
    .doc(formData.formId)
    .collection('responses', ref => ref.where("timestamp", ">=", date))
    .valueChanges();
    return ref;
}

  getResultsFormsForeign(data) {
    // const api_url = `http://localhost:5001/foreigndb/encuesta`
      const api_url = (data.api_url) ? `${data.api_url}/foreigndb/encuesta` : `https://octo-api-wa.herokuapp.com/foreigndb/encuesta`;
    const dates = {
      begin: data.begin,
      end: data.end,
      page: data.page
    }
      let headers = new HttpHeaders({ 'Content-Type': 'application/JSON' });
    const req = this.httpClient.post(api_url, JSON.stringify(dates), {headers: headers, responseType: 'json'});
    return req;
}

  // END OF FORMS SERVICES

  // TICKETS SERVICES

  getTickets(companyId: string) {
    let ref = this.db.collection('tickets')
      .doc(companyId)
      .collection('tickets', ref => ref.orderBy('date', 'desc'))
      .get()
    return ref;
  }
  // END OF TICKETS SERVICES

  getOrders(companyId: string) {
    
    let ref = this.db.collection('delivery')
    .doc(companyId)
    .collection('orders', ref => ref.orderBy('timestamp', 'desc'))
    return ref.stateChanges(['added', 'modified'])
  }
  //END OF ORDERS
}
