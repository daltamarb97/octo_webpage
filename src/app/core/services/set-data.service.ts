import { Injectable } from '@angular/core';
import { AngularFirestore } from '@angular/fire/firestore';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class SetDataService {

  constructor(
    private db: AngularFirestore,
    private http: HttpClient
  ) { }


  // PAYMENTS TABLE SERVICES

  setTableData(buildingId, data){
    // set data to a specific payment table using Excel
    let ref = this.db.collection('payment_tables')
    .doc(buildingId)
    
    return ref.collection('rows_data')
    .add(data)
    .then((docRef)=>{
        ref.collection('rows_data')
        .doc(docRef.id)
        .update({
          rowId: docRef.id,
          manualEmail: false,
          pending_to_pay: data.amount_to_pay
        }).then(() => {
          // create reference of legalIds of people on subcollection id_facility
          ref.collection('id_facility')
          .doc(docRef.id)
          .set({
            facility: data.facility_number,
            id: data.legal_id,
            rowId: docRef.id
          })
        })
    })
  }

  
  updateSingleRow(buildingId, rowId, data){
    // update single row data in firebase
    let ref = this.db.collection('payment_tables/')
    .doc(buildingId)
    .collection('rows_data')
    .doc(rowId)

    return ref.update(data).then(()=>{
      console.log('updated successfully');    
    });
  }


  updatePendingToPay(buildingId:string, rowId:string, data, paymentData:object){
    // update pending_to_pay data in firebase table
    let ref = this.db.collection('payment_tables/')
    .doc(buildingId)
    .collection('rows_data')
    .doc(rowId)

    return ref.update({
      pending_to_pay: data
    }).then(()=>{
      this.updatePaymentRecords(rowId, paymentData);
    });
  }


  private updatePaymentRecords(rowId:string, paymentData:object){
    let ref = this.db.collection('payments_records')
    .doc(rowId)
    .collection('record_of_payments')

    return ref.add(paymentData).then(docRef => {
      const paymentId = docRef.id;
      // update paymentId
      ref.doc(paymentId)
      .update({
        paymentId: paymentId
      }).then(()=> console.log('payment updated successfully'));
    })
  }


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

  // END OF PAYMENTS TABLE SERVICES

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
        comapnyId: companyData.companyId
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
        comapnyId: companyData.companyId
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

  // END USER CREATION SERVICES

  // --*--*--*--*--*--*--*--*--*--*--*--*--*--*--*--*--*--*--*

  // CHATS AND COMUNICATIONS SERVICES

  createDefaultChatRoom(comapnyId:string, companyName:string, roomData:any, userId:string){
    // creates building chats db ref and default chat room
    let ref = this.db.collection('chats')
    .doc(comapnyId)

    return ref.set({
      comapnyId: comapnyId,
      comapny: companyName
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


  createChatRoom(buildingId:string, roomData:any, userId:string, participants:Array<any>){
    // creates new Chat room
      let ref = this.db.collection('chats')
      .doc(buildingId)

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
            if(p.property){
              ref.collection('rooms')
              .doc(roomId)
              .collection('participants')
              .doc(p.userId)
              .set({
                userId: p.userId,
                name: p.name,
                lastname: p.lastname,
                property: p.property
              }).then(()=>{
                // push room infor into user node
                this.setChatRoomInfoInUser(
                  p.userId,  
                  roomId, 
                  roomData.roomName, 
                  roomData.roomDescription
                )
              })
            }else{
              ref.collection('rooms')
              .doc(roomId)
              .collection('participants')
              .doc(p.userId)
              .set({
                userId: p.userId,
                name: p.name,
                lastname: p.lastname,
                property: p.job
              }).then(()=>{
                this.setChatRoomInfoInUser(
                  p.userId,  
                  roomId, 
                  roomData.roomName, 
                  roomData.roomDescription
                )
              })
            }
          })
        }).then(()=>{
          this.setChatRoomInfoInUser(userId, roomId, roomData.roomName, roomData.roomDescription);
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


  sendChatMessage(buildingId, roomId, messageData){
    // send chat message to firestore
    let ref = this.db.collection('chats')
    .doc(buildingId)
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

  createAnnouncement(buildingId:string, data:object){
    // update body or title of the announcement
    let ref = this.db.collection('board')
    .doc(buildingId)
    .collection('announcements')

    return ref.add(data)
    .then((docRef)=>{
      const announcementId = docRef.id;
      // update document with announcementId
      ref.doc(announcementId)
      .update({
        announcementId : announcementId
      });

      console.log('creation of announcement done');
      
    });
  }
  

  updateAnnouncement(buildingId:string, announcementId:string, data:object){
    // update body or title of the announcement
    let ref = this.db.collection('board')
    .doc(buildingId)
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
