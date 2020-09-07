import { Injectable } from '@angular/core';
import { AngularFirestore } from '@angular/fire/firestore';
import { HoldDataService } from './hold-data.service';
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
      balance: 0.00
    })
    await this.db.collection('users')
      .doc(userData.userId)
      .update({
        companyId: companyId
    })
    // enter employee info
    await ref.doc(companyId)
      .collection('employees')
      .doc(userData.userId)
      .set(userData)
    // enter plan quota info
    await ref.doc(companyId)
      .collection('quotas')
      .doc('whatsapp')
      .set({
        // handled by server (free quota)
        messages: 0,
        senders: 0
      })
    // create default hat room
    await this.createChatRoom(
      companyId, 
      {roomName: 'General', 
      roomDescription: 'Sala de chat dónde todos los miembros del edificio estan automáticamente'
      }, 
      [userData],
    );
    await this.setCompanyInfoInUserNode(userData.userId, {name: companyData.name, companyId: companyId});  
  }

  createNewUser(data){
    // set new user
    let ref = this.db.collection('users')
    .doc(data.userId)

    return ref.set(data);
  }

  async setUserInfoInCompany(userData, companyData: any){
    // use this function when user enters invite code  
    // set info of user in employees subcollection of company
    let companyRef = this.db.collection('company')
      .doc(companyData.companyId)
      .collection('employees')
      .doc(userData.userId);

    await companyRef.set(userData)
     // set companyId on new user
    await this.db.collection('users')
      .doc(userData.userId)
      .update({
        companyId: companyData.companyId
      })
    await this.setCompanyInfoInUserNode(userData.userId, {
      name: companyData.company, 
      companyId: companyData.companyId
    });  
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


  async createChatRoom(companyId:string, roomData:any, participants:Array<any>){ 
    const roomId: string = this.holdData.createRandomId();
    participants.forEach(async (p)=>{
      // push room info into user node
      await this.stepIntoChatRoom(
        {
          ...roomData,
          roomId: roomId, 
        },
        p,
        companyId
      )
    }) 
    // creates new Chat room
    await this.db.collection('chats')
    .doc(companyId)
    .collection('rooms')
    .doc(roomId)
    .set({
      roomName: roomData.roomName,
      roomDescription: roomData.roomDescription,
      roomId: roomId
    })

    participants.forEach(async (p)=>{
      // push participants info in chat room
      await this.setEmplKeyInChatOnCreate(
        companyId,
        roomId,
        p
      )
    }) 
  }


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

  sendWhatsappMessage(companyId: string, number: string, messageData){
    // send chat message to firestore
    let ref = this.db.collection('whatsapp')
    .doc(companyId)
    .collection('chats')
    .doc(number)
    .collection('messages')

    return ref.add({
      inbound: messageData.inbound,
      message: messageData.message,
      timestamp: messageData.timestamp
    })
    .then(docRef => {
      ref.doc(docRef.id)
      .update({
        messageId: docRef.id
      })
    })
  }

  
  sendWhatsappMessageHttp(data){
    const api_url = "https://octo-api-wa.herokuapp.com/message/sendFromOcto"
    const finalData = {
      message: data.message,
      number: data.number,
      template: data.template, 
      companyId: data.companyId
    }
    let headers = new HttpHeaders({ 'Content-Type': 'application/JSON' });
    const req = this.httpClient.post(api_url, JSON.stringify(finalData), {headers: headers, responseType: 'text'});
    return req;
  }

  // END OF CHATS AND COMUNICATIONS SERVICES

  // --*--*--*--*--*--*--*--*--*--*--*--*--*--*--*--*--*--*--*

  // BOARD SERVICES

  // private uploadTaskFile(companyId: string, taskId: string, fileId: string, file:any) {
  //   const storage = firebase.storage();
  //   let ref =  storage.ref(`/tasks/${companyId}/${taskId}/${fileId}`);
  //   return ref.put(file);
  // }


  // createTask(companyId:string, data:any){
  //   // update body or title of the announcement
  //   let ref = this.db.collection('board')
  //   .doc(companyId)
  //   .collection('tasks')

  //   return ref.add({
  //     title: data.title,
  //     body: data.details,
  //     timestamp: data.timestamp,
  //     assignedTo: data.assignedTo,
  //     assignedBy: data.assignedBy,
  //   })
  //     .then(async (docRef)=>{
  //       const taskId: string = docRef.id;
  //       // update document with announcementId
  //       ref.doc(taskId)
  //       .update({
  //         taskId: taskId
  //       });
  //       // if file, uploads it
  //       if (data.file === true) {
  //         const fileId = this.holdData.createRandomId();
  //         ref.doc(taskId)
  //         .update({
  //           fileId: fileId
  //         })
  //         await this.uploadTaskFile(companyId, taskId, fileId, data.fileInfo);
  //         console.log('la imagen se subió');     
  //       } else {
  //         // do nothing
  //       }
  //     });
  // }


  // updateTask(companyId:string, data:any){
  //   // update body or title of the announcement
  //   let ref = this.db.collection('board')
  //   .doc(companyId)
  //   .collection('tasks')
  //   .doc(data.taskId)

  //   return ref.update(data)
  // }

  
  // sendComments(companyId: string, taskId: string, comment){
  //   // send comment to a task
  //   let ref = this.db.collection('board')
  //   .doc(companyId)
  //   .collection('tasks')
  //   .doc(taskId)
  //   .collection('comments')

  //   if (comment.file !== false) {
  //     return ref.add({
  //       name: comment.name,
  //       lastname: comment.lastname,
  //       text: comment.text,
  //       timestamp: comment.timestamp,
  //       userId: comment.userId,
  //       file: comment.file,
  //       fileName: comment.fileInfo.name
  //     })
  //     .then(async (docRef)=>{
  //       const commentId: string = docRef.id;
  //       // update document with announcementId
  //       ref.doc(commentId)
  //       .update({
  //         commentId: commentId
  //       });
  //       // if file, uploads it
  //       const fileId = this.holdData.createRandomId();
  //       ref.doc(commentId)
  //       .update({
  //         fileId: fileId
  //       })
  //       await this.uploadCommentFile(companyId, taskId, commentId, fileId, comment.fileInfo);     
  //     });
  //   } else {
  //     return ref.add({
  //       name: comment.name,
  //       lastname: comment.lastname,
  //       text: comment.text,
  //       timestamp: comment.timestamp,
  //       userId: comment.userId,
  //       file: comment.file,
  //     })
  //     .then(async (docRef)=>{
  //       const commentId: string = docRef.id;
  //       // update document with announcementId
  //       ref.doc(commentId)
  //       .update({
  //         commentId: commentId
  //       });     
  //     });
  //   }
  // }


  // private uploadCommentFile(companyId: string, taskId: string, commentId: string, fileId: string, file:any) {
  //   const storage = firebase.storage();
  //   let ref =  storage.ref(`/tasks/${companyId}/${taskId}/comments/${commentId}/${fileId}`);
  //   return ref.put(file);
  // }
  // END OF BOARD SERVICES

  // --*--*--*--*--*--*--*--*--*--*--*--*--*--*--*

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

}

