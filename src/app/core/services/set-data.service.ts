import { Injectable } from '@angular/core';
import { AngularFirestore } from '@angular/fire/firestore';
import { HoldDataService } from './hold-data.service';
import * as firebase from 'firebase';
import { HttpClient, HttpHeaders } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class SetDataService {

  constructor(
    private db: AngularFirestore,
    private holdData: HoldDataService,
    private httpClient: HttpClient,
  ) {}


  sendPrivateMessage(data){
    // send private message of payment reminder 
    let ref = this.db.collection('privatechat')
    .doc(data.chatId)
    .collection('messages')

    return ref.add(data.messageData);
  }


  setKeyOfPrivateChat(data){
    // set key of private chat in both sender and receiver
    let ref = this.db.collection('users')
    .doc(data.localUserId)
    .collection('keyChats')
    .doc(data.foreignUserId)

    return ref.set(data.chatData);
  }


  // --*--*--*--*--*--*--*--*--*--*--*--*--*--*--*--*--*--*--*

  // USER CREATION SERVICES

  async setNewCompany(companyData, userData){
    // set the company info
    let companyId;
    let ref = this.db.collection('company')

    const c = await ref.add(companyData);
    companyId = c.id;
    await ref.doc(companyId).update({
      companyId: companyId,
      admin: userData.userId,
    })
    await this.db.collection('users')
      .doc(userData.userId)
      .update({
        companyId: companyId
    })
    await this.setCompanyInfoInUserNode(userData.userId, {name: companyData.name, companyId: companyId});  
    // enter employee info
    await ref.doc(companyId)
      .collection('employees')
      .doc(userData.userId)
      .set(userData)
    // create default hat room
    // await this.createChatRoom(
    //   companyId, 
    //   {roomName: 'General', 
    //   roomDescription: 'Sala de chat dónde todos los miembros del edificio estan automáticamente'
    //   }, 
    //   [userData],
    // );
  }

  createNewUser(data){
    // set new user    
    let ref = this.db.collection('users')
    .doc(data.userId)

    return ref.set(data);
  }

  async setUserInfoInCompany(userData, companyData: any){
    // use this function when user enters invite code  
    await this.setCompanyInfoInUserNode(userData.userId, {
      name: companyData.name, 
      companyId: companyData.companyId
    });  
    await this.db.collection('users')
      .doc(userData.userId)
      .update({
        companyId: companyData.companyId
    });
    // set info of user in employees subcollection of company
    let companyRef = this.db.collection('company')
      .doc(companyData.companyId)
      .collection('employees')
      .doc(userData.userId);

    await companyRef.set(userData)
     // set companyId on new user
  }

  setInviteEmails(data) {
    let ref = this.db.collection('invites')
    
    return ref.add(data)
    .then(docRef => {
      const inviteId = docRef.id;
      ref.doc(inviteId)
      .update({
        inviteId: inviteId
      })
    })
  }

  private async setCompanyInfoInUserNode(userId: string, companyData: any) {
    let ref = this.db.collection('users')
    .doc(userId)
    .collection('companies')
    .doc(companyData.companyId)

    return await ref.set({
      name: companyData.name,
      companyId: companyData.companyId
    })
  }

  updateCompanyIdInUser(userId: string, companyId: string) {
    let ref = this.db.collection('users')
    .doc(userId)
    
    return ref.update({
      companyId: companyId
    })
  }
  // END USER CREATION SERVICES

  // --*--*--*--*--*--*--*--*--*--*--*--*--*--*--*--*--*--*--*

  // CHATS AND COMUNICATIONS SERVICES

  async stepIntoChatRoom(data, userdata, companyId) {
    let ref = this.db.collection('users')
    .doc(userdata.userId)
    .collection('chatRooms')
    .doc(companyId)
    .collection('rooms')
    .doc(data.roomId)

    await  ref.set({
      roomDescription: data.roomDescription,
      roomId: data.roomId,
      roomName: data.roomName
    })
  }

  private async setEmplKeyInChatOnCreate(companyId: string, roomId: string, userdata: any) {
    await this.db.collection('chats')
      .doc(companyId)
      .collection('rooms')
      .doc(roomId)
      .collection('participants')
      .doc(userdata.userId)
      .set({
        userId: userdata.userId,
        name: userdata.name,
        lastname: userdata.lastname
    })
  }


  // async createChatRoom(companyId:string, roomData:any, participants:Array<any>){ 
  //   const roomId: string = this.holdData.createRandomId();
  //   participants.forEach(async (p)=>{
  //     // push room info into user node
  //     await this.stepIntoChatRoom(
  //       {
  //         ...roomData,
  //         roomId: roomId, 
  //       },
  //       p,
  //       companyId
  //     )
  //   }) 
  //   // creates new Chat room
  //   await this.db.collection('chats')
  //   .doc(companyId)
  //   .collection('rooms')
  //   .doc(roomId)
  //   .set({
  //     roomName: roomData.roomName,
  //     roomDescription: roomData.roomDescription,
  //     roomId: roomId
  //   })

  //   participants.forEach(async (p)=>{
  //     // push participants info in chat room
  //     await this.setEmplKeyInChatOnCreate(
  //       companyId,
  //       roomId,
  //       p
  //     )
  //   }) 
  // }


  async createPrivateChat(localData, foreignData, companyId) {
    // first set keys in both sender and receiver
    const chatId = this.db.createId(); // create random chatId
    let ref = this.db.collection('users')
    .doc(localData.userId)
    .collection('keyChats')
    .doc(companyId)
    .collection('chats')
    .doc(foreignData.userId)

      await ref.set({
      chatId: chatId,
      name: foreignData.name,
      lastname: foreignData.lastname
    })
    .then(() => {
      let refForeign = this.db.collection('users')
      .doc(foreignData.userId)
      .collection('keyChats')
      .doc(companyId)
      .collection('chats')
      .doc(localData.userId)

      refForeign.set({
        chatId: chatId,
        name: localData.name,
        lastname: localData.lastname
      })
    });
    const newChat = {chatId: chatId,
      name: foreignData.name,
      lastname: foreignData.lastname} 
      return newChat
  }

  sendChatMessage(companyId, roomId, messageData){
    // send chat message to firestore
    let ref = this.db.collection('chats')
    .doc(companyId)
    .collection('rooms')
    .doc(roomId)
    .collection('messages')

    return ref.add({
      name: messageData.name,
      lastname: messageData.lastname,
      message: messageData.message,
      timestamp: messageData.timestamp,
      userId: messageData.userId
    })
  }


  sendPrivateChatMessage(chatId:string, messageData){
    // send privatechat message to firestore
    let ref = this.db.collection('privatechat')
    .doc(chatId)
    .collection('messages')

    return ref.add({
      name: messageData.name,
      lastname: messageData.lastname,
      message: messageData.message,
      timestamp: messageData.timestamp,
      userId: messageData.userId
    })
  }

  assignWhatsappChat(companyId: string, phoneNumber: string, assignedData) {
    let ref=  this.db.collection('whatsapp')
    .doc(companyId)
    .collection('chats')
    .doc(phoneNumber)

    return ref.update({
      assignedTo: assignedData.userId,
      assignedName: assignedData.name
    })
  }

  sendWhatsappMessageFirebase(companyId: string, number: string, messageData){
    // send chat message to firestore
    let ref = this.db.collection('whatsapp')
    .doc(companyId)
    .collection('chats')
    .doc(number)
    .collection('messages')

    if(messageData.mediaUrl) {
      return ref.add({
        inbound: messageData.inbound,
        message: messageData.message,
        timestamp: messageData.timestamp,
        mediaUrl: messageData.mediaUrl,
        MediaContentType: messageData.MediaContentType
      })
      .then(docRef => {
        ref.doc(docRef.id)
        .update({
          messageId: docRef.id
        })
      })
    } else {
      return ref.add({
        inbound: messageData.inbound,
        message: messageData.message,
        timestamp: messageData.timestamp,
        })
        .then(docRef => {
          ref.doc(docRef.id)
          .update({
            messageId: docRef.id
          })
        })
    }
  }

  
  sendWhatsappMessageHttp(data){
     //const api_url = "http://localhost:5000/message/sendFromOcto"
    const api_url = (data.api_url) ? `${data.api_url}/message/sendFromOcto` : "https://octo-api-wa.herokuapp.com/message/sendFromOcto";
    if(data.mediaUrl) {
        const finalData = {
          message: data.message,
          number: data.number,
          template: data.template, 
          companyId: data.companyId,
          mediaUrl: data.mediaUrl
        }
        // api request
        let headers = new HttpHeaders({ 'Content-Type': 'application/JSON' });
        const req =  this.httpClient.post(api_url, JSON.stringify(finalData), {headers: headers, responseType: 'text'});
        return req;           
    } else {
      const finalData = {
        message: data.message,
        number: data.number,
        template: data.template, 
        companyId: data.companyId
      }
        // api request
      let headers = new HttpHeaders({ 'Content-Type': 'application/JSON' });
      const req =  this.httpClient.post(api_url, JSON.stringify(finalData), {headers: headers, responseType: 'text'});
      return req;
    }
  }


  async uploadMediaFile (companyId: any, number: string, file, fileName: string) {
    const storage = firebase.storage();
    let ref =  storage.ref(`/whatsappMedia/${companyId}/${number}/${fileName}`);
    const rta = await ref.put(file);
    const url = await rta.ref.getDownloadURL();
    return url;
  }

  async sendChatComment(data) {
    let ref = this.db.collection('whatsapp')
    .doc(data.companyId)
    .collection('chats')
    .doc(data.number)
    .collection('comments')
    const comment = await ref.add({
      agent: data.agent,
      body: data.body,
      timestamp: data.timestamp
    });
    return ref.doc(comment.id)
    .update({
      commentId: comment.id
    });
  }

  async archiveChat(data) {
    let ref = this.db.collection('whatsapp')
    .doc(data.companyId)
    .collection('chats')
    .doc(data.number)
    return ref.set({
      number: data.number,
      finished: true,
    })
  }

  // --*--*--*--*--*--*--*--*--*--*--*--*--*--*--*
  sendTag(companyId, chatId, tag){
    // send tag to firestore
    let ref = this.db.collection('whatsapp')
    .doc(companyId)
    .collection('chats')
    .doc(chatId)
    .collection('tags')
    .doc(tag.tagId)

    return ref.set({
      categoryId:tag.categoryId,
      name:tag.name,
      tagId:tag.tagId
    })
  }
  
  addToTagCounter(companyId, tag){
    //add to times counter for statistics
    let ref = this.db.collection('whatsapp')
    .doc(companyId)
    .collection('tags')
    .doc(tag.categoryId)
    .collection('tagsnames')
    .doc(tag.tagId)

    return ref.update({
      times:tag.times+1
    })
    ;
    
  }
  sendTagToCategories(companyId, categoryId, name){
    // send tag to Categories to firestore
    let ref = this.db.collection('whatsapp')
    .doc(companyId)
    .collection('tags')
    .doc(categoryId)
    .collection('tagsnames')

    return ref.add({
      name: name,
      categoryId:categoryId,
      times: 0,
    })
    .then(docRef => {
      const tagId: string = docRef.id;
      ref.doc(tagId)
      .update({
        tagId: tagId
      })
    })
   }
   createCategory(companyId, categoryName){
    // send tag to Categories to firestore
    let ref = this.db.collection('whatsapp')
    .doc(companyId)
    .collection('tags')
    

    return ref.add({
      name: categoryName,            
    })
    .then(docRef => {
      const categoryId: string = docRef.id;
      ref.doc(categoryId)
      .update({
        categoryId: categoryId
      })
    })
   }
    // END OF WhatsApp services

  // --*--*--*--*--*--*--*--*--*--*--*--*--*--*--*

  //
  
  // OTHER SERVICES

  sendSupportMessage(data, messsage: string) {
    let ref = this.db.collection('support')
    .doc(data.companyId)
    .collection('tickets')

    return ref.add({
      message: messsage,
      name: data.name,
      userId: data.userId
    })
    .then(docRef => {
      const ticketId: string = docRef.id;
      ref.doc(ticketId)
      .update({
        ticketId: ticketId
      })
    })
  }

  // FLOW SERVICES

  async setOptionInFlow(companyId: string, parentFlowId: string, dataChildOption: any) {
    // create option 
    let ref = this.db.collection('whatsapp')
      .doc(companyId)
      .collection('flow')
    const flowCreation = await ref.add({
      message: dataChildOption.message,
      agent: dataChildOption.agent,
      options: dataChildOption.options,
      mediaUrl: dataChildOption.mediaUrl,
    })
    await ref.doc(flowCreation.id)
      .update({flowId: flowCreation.id})
    let optionNumber;
    await ref.doc(parentFlowId)
      .collection('options')
      .get()
      .toPromise().then(data => {
        optionNumber = data.docs.length + 1;
      })
    const optUpdate = await ref.doc(parentFlowId)
      .collection('options')
      .add({
        redirectTo: flowCreation.id,
        message: dataChildOption.name,
        optionNumber: optionNumber.toString(),
      })
    await ref.doc(parentFlowId)
      .collection('options')
      .doc(optUpdate.id)
      .update({
        optionId: optUpdate.id
      })
    return flowCreation.id;
  }

  async createFirstFlow(companyId: string, message: string) {
    let ref = this.db.collection('whatsapp')
      .doc(companyId)
      .collection('flow')
    const mainFlow = await ref.add({
        message: message,
        main: true
      })
    return ref.doc(mainFlow.id)
      .update({
        flowId: mainFlow.id
      })
  }

  async uploadFileForOption(companyId: string, fileName: string, file) {
    const storage = firebase.storage();
    let ref =  storage.ref(`/flows/${companyId}/${fileName}`);
    const rta = await ref.put(file);
    const url = await rta.ref.getDownloadURL();
    return url;
  }

  async updateMessageFlow(data){
    let ref = this.db.collection('whatsapp')
      .doc(data.companyId)
      .collection('flow')
      .doc(data.flowId)
      
      return ref.update({
        message: data.message
      })
  }
  // END OF FLOW SERVICES
}

