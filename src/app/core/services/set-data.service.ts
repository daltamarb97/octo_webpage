import { Injectable } from '@angular/core';
import { AngularFirestore } from '@angular/fire/firestore';
import * as firebase  from "firebase"
import { HoldDataService } from './hold-data.service';

@Injectable({
  providedIn: 'root'
})
export class SetDataService {

  constructor(
    private db: AngularFirestore,
    private holdData: HoldDataService,
  ) { }


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

  setNewCompany(companyData, personData){
    // set the company info
    let ref = this.db.collection('company')

    return ref.add(companyData)
      .then((docRef)=>{
        let companyId = docRef.id;
        companyData.companyId = companyId;
        const companyPassword = this.createRandomBuildingPassword();
        ref.doc(companyId).update({
          companyId: companyId,
          companyPassword: companyPassword,
          paymentLink: 'Cuenta Gratuita'
        }).then(()=>{
          // creates user 
          this.createNewUser(personData, companyData);
          // creates default chatRoom for this company
          // General is the default chat room
          this.createDefaultChatRoom(
            companyData.companyId, 
            companyData.name, 
            {roomName: 'General', 
            roomDescription: 'Sala de chat dónde todos los miembros del edificio estan automáticamente'
            }, 
            personData.userId
          );
        }).then(() => {
          // set reference of companies passwords for user register in the same company
          ref.doc('companyPasswords')
          .collection('references')
          .doc(companyId)
          .set({
            companyId: companyId,
            companyPassword: companyPassword,
            name: companyData.name
          })
        })
    })
  }


  private createRandomBuildingPassword(){
    // creation of random building pasword for residents registration
      let possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZ1234567890*&^%$#@!";
      const lengthOfCode = 10;
      let text = "";
      for (let i = 0; i < lengthOfCode; i++) {
        text += possible.charAt(Math.floor(Math.random() * possible.length));
      }
      return text;
  }


  createNewUser(data, companyData){
    // set new user
    let ref = this.db.collection('users')
    .doc(data.userId)

    return ref.set(data).then(()=>{
      // set additional user data
      ref.update({
        userId: data.userId,
        companyId: companyData.companyId
      }).then(()=>{          
          // set info of user in employees subcollection of company
          let companyRef = this.db.collection('company')
            .doc(companyData.companyId)
            .collection('employees')
            .doc(data.userId);

            companyRef.set(data)
        })
    }).catch(err =>{
      console.log(err);
    })
  }


  createNewUserAfterCompany(data, companyData, chatRooms){
    // set new user when company already exists
    let ref = this.db.collection('users')
    .doc(data.userId)

    return ref.set(data).then(()=>{
      // set additional user data
      ref.update({
        userId: data.userId,
        companyId: companyData.companyId
      }).then(()=>{          
          // set info of user in employees subcollection of company
          let companyRef = this.db.collection('company')
            .doc(companyData.companyId)
            .collection('employees')
            .doc(data.userId);

            companyRef.set(data)
        }).then(() => {
          // step into default chatRoom for this company
          for (let i in chatRooms) {
            this.stepIntoChatRoom(chatRooms[i], data.userId);
          }
        }) 
    }).catch(err =>{
      console.log(err);
    })
  }


  doormanCreationTrigger(buildingId: string, doormanData: any){
    // create firestore trigger to shot cloud functions which creates doorman account
    let ref = this.db.collection('buildings')
    .doc(buildingId)
    .collection('employees')

    return ref.add(doormanData)
    .then(docRef => {
      // update doorman node inside buildings document
      const doormanId = docRef.id;
      ref.doc(doormanId)
      .update({
        doormanId: doormanId,
        buildingId: buildingId
      })
      .then(()=>{
        // create doorman user in users node
        let refUsers = this.db.collection('users')
        .doc(doormanId)

        refUsers.set({
          name: doormanData.name,
          email: doormanData.email,
          isDoorman: true,
          buildingId: buildingId,
          userId: doormanId
        })
        .then(()=>console.log('doorman created in users node'))
        .catch(err => console.log(err))
    })
      .catch(err => console.log(err))
    })   
    .catch(err => console.log(err))
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

  // END USER CREATION SERVICES

  // --*--*--*--*--*--*--*--*--*--*--*--*--*--*--*--*--*--*--*

  // CHATS AND COMUNICATIONS SERVICES

  createDefaultChatRoom(companyId:string, companyName:string, roomData:any, userId:string){
    // creates building chats db ref and default chat room
    let ref = this.db.collection('chats')
    .doc(companyId)

    return ref.set({
      companyId: companyId,
      company: companyName
    }).then(()=>{
      ref.collection('rooms')
      .add({
        roomName: roomData.roomName,
        roomDescription: roomData.roomDescription,
        isDefault: true,
      }).then(docRef =>{
        const roomId = docRef.id;
        ref.collection('rooms')
        .doc(roomId)
        .update({
          roomId: roomId
        }).then(()=>{
          this.setChatRoomInfoInUser(userId, roomId, roomData.roomName, roomData.roomDescription);
        })
      })
    })
  }


  stepIntoChatRoom(data, userId:string) {
    let ref = this.db.collection('users')
    .doc(userId)
    .collection('chatRooms')
    .doc(data.roomId)

    return ref.set({
      roomDescription: data.roomDescription,
      roomId: data.roomId,
      roomName: data.roomName
    })
  }


  createChatRoom(companyId:string, roomData:any, userId:string, participants:Array<any>){
    // creates new Chat room
      let ref = this.db.collection('chats')
      .doc(companyId)

      return ref.collection('rooms')
      .add({
        roomName: roomData.roomName,
        roomDescription: roomData.roomDescription,
      }).then(docRef =>{
        const roomId = docRef.id;
        ref.collection('rooms')
        .doc(roomId)
        .update({
          roomId: roomId
        }).then(()=>{
          // each participant is pushed into specific chat room
          participants.forEach((p)=>{
              ref.collection('rooms')
              .doc(roomId)
              .collection('participants')
              .doc(p.userId)
              .set({
                userId: p.userId,
                name: p.name,
                lastname: p.lastname
              }).then(()=>{
                // push room infor into user node
                this.setChatRoomInfoInUser(
                  p.userId,  
                  roomId, 
                  roomData.roomName, 
                  roomData.roomDescription
                )
              })
          })
        })
      }) 
  }


  createPrivateChat(localData, foreignData) {
    // first set keys in both sender and receiver
    const chatId = this.db.createId(); // create random chatId
    let ref = this.db.collection('users')
    .doc(localData.userId)
    .collection('keyChats')
    .doc(foreignData.userId)

    return ref.set({
      chatId: chatId,
      name: foreignData.name,
      lastname: foreignData.lastname
    })
    .then(() => {
      let refForeign = this.db.collection('users')
      .doc(foreignData.userId)
      .collection('keyChats')
      .doc(localData.userId)

      refForeign.set({
        chatId: chatId,
        name: localData.name,
        lastname: localData.lastname
      })
    });
  }


  private setChatRoomInfoInUser(userId, roomId, roomName, roomDescription){
    // link chat room to user participant or admin
    // (General/...(more default rooms to come)) is the default chat room an user is part of
    let refDefaultUserChatRoom = this.db.collection('users')
    .doc(userId)
    .collection('chatRooms')
    .doc(roomId)

    refDefaultUserChatRoom.set({
      roomId: roomId,
      roomName: roomName,
      roomDescription: roomDescription
    })
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
  // END OF CHATS AND COMUNICATIONS SERVICES

  // --*--*--*--*--*--*--*--*--*--*--*--*--*--*--*--*--*--*--*

  // BOARD SERVICES

  private uploadTaskFile(companyId: string, taskId: string, fileId: string, file:any) {
    const storage = firebase.storage();
    let ref =  storage.ref(`/tasks/${companyId}/${taskId}/${fileId}`);
    return ref.put(file);
  }


  createTask(companyId:string, data:any){
    // update body or title of the announcement
    let ref = this.db.collection('board')
    .doc(companyId)
    .collection('tasks')

    return ref.add({
      title: data.title,
      body: data.details,
      timestamp: data.timestamp,
      assignedTo: data.assignedTo,
      assignedBy: data.assignedBy,
    })
      .then(async (docRef)=>{
        const taskId: string = docRef.id;
        // update document with announcementId
        ref.doc(taskId)
        .update({
          taskId: taskId
        });
        // if file, uploads it
        if (data.file === true) {
          const fileId = this.holdData.createRandomId();
          ref.doc(taskId)
          .update({
            fileId: fileId
          })
          await this.uploadTaskFile(companyId, taskId, fileId, data.fileInfo);
          console.log('la imagen se subió');     
        } else {
          // do nothing
        }
      });
  }


  updateTask(companyId:string, announcementId:string, data:object){
    // update body or title of the announcement
    let ref = this.db.collection('board')
    .doc(companyId)
    .collection('announcements')
    .doc(announcementId)

    return ref.update(data)
    .then(()=>{
      console.log('announcement updated');
    }).catch(err => {
      console.log('an error happened: ' +err);
    });
  }
  
  // END OF BOARD SERVICES

  // --*--*--*--*--*--*--*--*--*--*--*--*--*--*--*

  
}
