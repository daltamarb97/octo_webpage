import { Injectable } from '@angular/core';
import { AngularFirestore } from '@angular/fire/firestore';
import { HoldDataService } from './hold-data.service';
import * as firebase from 'firebase';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { FecthDataService } from './fecth-data.service';

@Injectable({
  providedIn: 'root'
})
export class SetDataService {

  constructor(
    private db: AngularFirestore,
    private holdData: HoldDataService,
    private fetchData: FecthDataService,
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
    // set userInfo of admin in agents weight for whatsapp
    let weightRef = this.db.collection('whatsapp')
    .doc(companyId)
    .collection('weights')
    .doc(userData.userId);

    await weightRef.set({
      email: userData.email,
      name: `${userData.name} ${userData.lastname}`,
      userId: userData.userId,
      weight: 0
    })
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
     // set userInfo in agents weight for whatsapp
     let weightRef = this.db.collection('whatsapp')
      .doc(companyData.companyId)
      .collection('weights')
      .doc(userData.userId);

    await weightRef.set({
      email: userData.email,
      name: `${userData.name} ${userData.lastname}`,
      userId: userData.userId,
      weight: 0
    })
  }

  async setInviteEmails(data) {
    let ref = this.db.collection('invites')
    let inviteId;
    await ref.add(data)
    .then(docRef => {
      inviteId = docRef.id;
      ref.doc(inviteId)
      .update({
        inviteId: inviteId
      })
    })
    return inviteId;
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

  async createWhatsappChatFromForms(companyId: string, data: any) {
    let ref=  this.db.collection('whatsapp')
    .doc(companyId)
    .collection('chats')
    .doc(data.number)
    await ref.set({
      agent: true,
      assignTo: data.assignTo,
      hasTicket: true,
      number: data.number,
      private: false,
      ticketId: data.ticketId
    });
    return;
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

  async sendWhatsappMessageFirebase(companyId: string, number: string, messageData){
    // update timestamp of chat contact
    await this.updateTimestampOnMessageSent(companyId, number, messageData.timestamp);
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

  private async updateTimestampOnMessageSent(companyId: string, number: string, timestamp: any) {
    // update timestamp on outbound message 
    let ref = this.db.collection('whatsapp')
    .doc(companyId)
    .collection('chats')
    .doc(number)
    await ref.update({
      timestamp: timestamp
    })
    return;
  }

  sendWhatsappMessageHttp(data){
     const responseId = this.holdData.createRandomId(); 
    //  const api_url = "http://localhost:5000/message/sendFromOcto"
    const api_url = (data.api_url) ? `${data.api_url}/message/sendFromOcto` : "https://octo-api-wa.herokuapp.com/message/sendFromOcto";
    if(data.mediaUrl) {
        const finalData = {
          message: data.message,
          number: data.number,
          template: data.template, 
          companyId: data.companyId,
          mediaUrl: data.mediaUrl,
          responseId: (data.form) ? responseId : 0,
          form: data.form
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
        companyId: data.companyId,
        form: data.form,
        responseId: (data.form) ? responseId : 0,
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
    // const metadata = await ref.getMetadata(); 
    const url = await rta.ref.getDownloadURL();
    return url;
  }

  setMainFormUser(companyId: string, number: string, data) {
    let ref = this.db.collection('whatsapp')
    .doc(companyId)
    .collection('chats')
    .doc(number)
    .collection('form')
    .doc(data.questionId)

    return ref.set(data);
  }

  async sendChatComment(data) {
    let ref = this.db.collection('tickets')
    .doc(data.companyId)
    .collection('tickets')
    .doc(data.ticketId)
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
      finished: true,
      number: data.number,
      timestamp: data.timestamp,
    })

  }

  async archiveTicket(data) {
    let ref = this.db.collection('tickets')
    .doc(data.companyId)
    .collection('tickets')
    .doc(data.number)
    return ref.update({
      finished: true,
    })
  }

  async sendTicketIdToChat(number,companyId,ticketId) {
    let ref = this.db.collection('whatsapp')
    .doc(companyId)
    .collection('chats')
    .doc(number)
    return ref.update({
      ticketId: ticketId,
    })
  }

  async sendHasTicket(number: string, companyId: string, ticketId: string) {
    let ref = this.db.collection('whatsapp')
    .doc(companyId)
    .collection('chats')
    .doc(number)
    return ref.update({
      hasTicket: true,
      ticketId: ticketId
    })
  }

  async makeChatPrivate(number,companyId) {
    let ref = this.db.collection('whatsapp')
    .doc(companyId)
    .collection('chats')
    .doc(number)
    return ref.update({
      private: true,
    })
  }
  async changeNameOfChat(number,companyId,name) {
    let ref = this.db.collection('whatsapp')
    .doc(companyId)
    .collection('chats')
    .doc(number)
    return ref.update({
      chatName: name,
    })
  }

  async makeChatPublic(number,companyId) {
    let ref = this.db.collection('whatsapp')
    .doc(companyId)
    .collection('chats')
    .doc(number)
    return ref.update({
      private: false,
    })
  }

  async createTicket(ticket,companyId){
    // generate ticket in firestore
    let ref = this.db.collection('tickets')
    .doc(companyId)
    .collection('tickets')

    const rta = await ref.add(ticket);
    await ref.doc(rta.id).update({
      ticketId: rta.id
    })
    return rta.id;
 }


  async changeOptionNumber(data) {
    let ref = this.db.collection('whatsapp')
      .doc(data.companyId)
      .collection('flow')
      .doc(data.flowId);
    const opt1 = await ref.collection('options', ref => ref.where("optionNumber", "==", data.newPosition))
      .get();
    const opt2 = await ref.collection('options', ref => ref.where("optionNumber", "==", data.oldPosition))
      .get();
    opt1.subscribe(dataRta => {
      const optId = dataRta.docs[0].id;
      ref.collection('options').doc(optId).update({
        optionNumber: data.oldPosition
      })
    })
    opt2.subscribe(dataRta => {
      const optId = dataRta.docs[0].id;
      ref.collection('options').doc(optId).update({
        optionNumber: data.newPosition
      })
    })
    return;
  }

  async createQuickResponse(companyId: string, message: string) {
    let ref = this.db.collection('whatsapp')
    .doc(companyId)
    .collection('quickResponses')
    const rta = await ref.add({
      message: message
    });
    return ref.doc(rta.id).update({
      quickId: rta.id
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
    });
  }

  setAssignedpeople(companyId,chatId,people){
    //add person to assigned Chats
    let ref = this.db.collection('whatsapp')
    .doc(companyId)
    .collection('chats')
    .doc(chatId)
  
    return ref.update({
      assignTo:people
    });
  }

  async setStatus(companyId: string,ticketId: string, status: string, number: string){
    // change ticket status
    let ref = this.db.collection('tickets')
    .doc(companyId)
    .collection('tickets')
    .doc(ticketId)
    if(status === 'Completado') {
      let refChat = this.db.collection('whatsapp')
      .doc(companyId)
      .collection('chats')
      .doc(number)
      await refChat.update({
        hasTicket: false,
        ticketId: 'no ticket'
      });
    }
    await ref.update({
      status:status
    });
  }
  async setCommentsOnChatClosed(companyId: string,ticketId: string, comments){
    // change comments when the chat is closed
    let ref = this.db.collection('tickets')
    .doc(companyId)
    .collection('tickets')
    .doc(ticketId)
   
    await ref.update({
      comments:comments
    });
  }
  // sendTagToCategories(companyId, categoryId, name, trainingPhrases){
  //   // send tag to Categories to firestore
  //   let ref = this.db.collection('whatsapp')
  //   .doc(companyId)
  //   .collection('tags')
  //   .doc(categoryId)
  //   .collection('tagsnames')

  //   return ref.add({
  //     name: name,
  //     categoryId:categoryId,
  //     times: 0,
  //     trainingPhrases: trainingPhrases
  //   })
  //   .then(docRef => {
  //     const tagId: string = docRef.id;
  //     ref.doc(tagId)
  //     .update({
  //       tagId: tagId
  //     })
  //   })
  //  }


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
      mainMenuRedirect: dataChildOption.mainMenu,
      mediaUrl: dataChildOption.mediaUrl,
      assignTo: (dataChildOption.assignTo !== 'any') ? [dataChildOption.assignTo] : 'any',
      formId: dataChildOption.formId,
      responseId: dataChildOption.responseId
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
        optionNumber: optionNumber,
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
    await ref.doc(mainFlow.id)
      .update({
        flowId: mainFlow.id
      })
    return mainFlow.id;
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

  async updateFormMessage(data) {
    let ref = this.db.collection('whatsapp')
      .doc(data.companyId)
      .collection('forms')
      .doc(data.formId)
      .collection('content')
      .doc(data.questionId)
      if (data.responseType) {
        return ref.update({
          message: data.message,
          responseType: data.responseType
        })
      } else {
        return ref.update({
          message: data.message
        })
      }
  }

  setSendFormOnClose(companyId: string, ticketId: string, toggle: boolean) {
    let ref = this.db.collection('tickets')
      .doc(companyId)
      .collection('tickets')
      .doc(ticketId);
    return (toggle) ? ref.update({formClose: true}) : ref.update({formClose: true});
  }
  // END OF FLOW SERVICES

  async changeAgentAvailability(companyId: string, userId: string) {
    const currentUserInfoWeight = await this.fetchData.getUserInfoWeightOnce(companyId, userId).toPromise();
    let ref = this.db.collection('whatsapp')
      .doc(companyId)
      .collection('weights')
      .doc(userId);
    if (currentUserInfoWeight.data()) {
      return ref.update({
        available: !currentUserInfoWeight.data().available
      })
    } else {
      return ref.update({
        available: true
      })
    }
  }

  setUnseenToFalse(companyId: string, number: string) {
    let ref = this.db.collection('whatsapp')
      .doc(companyId)
      .collection('chats')
      .doc(number)
    return ref.update({
      unseen: false
    })
  }
}

