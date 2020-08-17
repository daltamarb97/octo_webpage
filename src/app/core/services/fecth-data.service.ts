import { Injectable } from '@angular/core';
import { AngularFirestore } from '@angular/fire/firestore';
import * as firebase from 'firebase';

@Injectable({
  providedIn: 'root'
})
export class FecthDataService {

  constructor(
    private db: AngularFirestore,
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


  getInviteCodes() {
    // retreive all company pass
    let ref = this.db.collection('invites')

    return ref.get();
  }

  // END BUIDLING SERVICES

  // --*--*--*--*--*--*--*--*--*--*--*--*--*--*--*--*--*--*--*

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

  getMessagesFromSpecificRoom(companyId: string, roomId: string, timestamp, limit: number){
    // get messages from specific room
    let ref = this.db.collection('chats')
    .doc(companyId)
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

  // TASK SERVICES
    
  getCompanyTasks(companyId){
    // get all the announcements for a building
    let ref = this.db.collection('board')
    .doc(companyId)
    .collection('tasks', ref => ref.orderBy('timestamp', 'desc'))
    
    return ref.valueChanges();
  }

  async getFileFromTask(data){
    // get file from specific task
    let rta = {
      contentType: '',
      url: '',
    };
    const storage = firebase.storage();
    let ref =  storage.ref(`/tasks/${data.companyId}/${data.taskId}/${data.fileId}`);
    const metadata = await ref.getMetadata();
    const url = await ref.getDownloadURL();
    if (metadata.contentType.includes('image')) {
      rta = {
        contentType: 'image',
        url: url,
      }
    } else{
      rta = {
        contentType: 'file',
        url: url,
      }
    }
    return rta;
  }

  // END OF TASK SERVICES

  // --*--*--*--*--*--*--*--*--*--*--*--*--*--*--*

   // DIRECTORY SERVICES
 
   getPrivateChatKey(userId,receiverId){
    let ref = this.db.collection('users')
    .doc(userId)
    .collection('keyChats')
    .doc(receiverId)

    return  ref.get();
  }


}
