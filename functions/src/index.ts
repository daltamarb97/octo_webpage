// UNCOMMENT AND DEPLOY WHEN LAUNCHING PRODUCTION

// import * as functions from 'firebase-functions'
// import * as admin from 'firebase-admin';

// import * as nodemailer from 'nodemailer'


// admin.initializeApp(functions.config().firebase);


// const SENDER_EMAIL= 'waypooltec@gmail.com';
// const SENDER_PASSWORD= 'Waypooltec2020';


// // function that sends reminder email in response of an event triggered by admin
// exports.sendPaymentEmailNotification = functions.firestore
//     .document('payment_tables/{buildingId}/rows_data/{rowId}')
//     .onUpdate((change, context)=>{
        
//         const snapshot = change.after.data();

//         if(snapshot){
//             const rceiverInfoEmail = snapshot.email;
//             const manualEmailConf = snapshot.manualEmail;

//             if(manualEmailConf === true){
                
//                 // email Logic stated here
//                 const authData = nodemailer.createTransport({
//                     host: 'smtp.gmail.com',
//                     port: 465,
//                     secure: true,
//                     auth: {
//                         user: SENDER_EMAIL,
//                         pass: SENDER_PASSWORD
//                     }
//                 });


//                 authData.sendMail({
//                     from: 'info@adpool.com',
//                     to: rceiverInfoEmail,
//                     subject: 'Atraso con pagos de administración',
//                     text: 'Te recordamos quue tienes un saldo pendiente de xxxxx que no ha sido pagado por concepto de cuota de administración del edificio xxxx. Favor pagar lo antes psible'
//                 }).then((res)=>{
//                     console.log('successfully sent email:' + res);
//                 }).catch(error =>{
//                     console.log('error has raised and it is: ' + error); 
//                 });

//                 //ALERTTTTTTTTTT
//                 // DELETE SETTIMEOUT FROM setFirestoreTriggerPaymentEmail FUNCTION IN SET-DATA.SERVICE.TS AND
//                 // SET manualEmail PROPERTY TO FALSE HERE WHEN DEPLOY
//                 ////////
//             }else{
//                 console.log('the update has nothing to do with email sending');
//             }   
//         }
//     })


    
// // function that updates pending_to_pay amount every month 
// exports.pendingToPayUpdate = functions.pubsub.schedule('0 0 1 * *')
//     .onRun((context)=>{
//         // get Ids of every building in DB
//         const ref = admin.firestore()
//         .collection('payment_tables')

//         ref.listDocuments().then((data)=>{
//             data.forEach((row)=>{
//                 getRowsDataArray(row.id)
//                 .catch((error)=>{
//                     console.log(error);
//                 })
//             });
//         }).catch((err)=>{
//             console.log('error cogiendo lista de buidlings: ' + err);
//         })

//         // declaration of function
//         function getRowsDataArray(buildingId:string){
//             // function that get old data and updated with the new one
//             const refi = admin.firestore()
//             .collection('payment_tables')
//             .doc(buildingId)
//             .collection('rows_data')
//             // get every row of every building
//             return refi.listDocuments().then((data)=>{
//                 data.forEach((row_info)=>{
//                     const rowInfo = row_info.get();
//                     rowInfo.then((inf)=>{
//                         const information = inf.data();
//                         if(information != undefined){
//                             // updates specific field which is pending_to_pay
//                             const amount_to_pay = information.amount_to_pay;
//                             const pending_to_pay = information.pending_to_pay;
//                             row_info.update({
//                                 pending_to_pay: pending_to_pay + amount_to_pay
//                             }).catch((err)=>{
//                                 console.log('el update fallo: ' + err); 
//                             })
//                         }   
//                     }).catch((err)=>{
//                         console.log('algo ocurruo con la info del row : ' + err);
//                     })
//                 })
//             }).catch((err)=>{
//                 console.log('algo ocurrio con lista de rows: ' + err); 
//             })
//         }
// })




// // function that creates doorman account
// exports.createDoormanAccount = functions.firestore
// .document('buildings/{buildingId}/employees/{doormanId}')
// .onCreate((snap, context) => {
//     const user = snap.data();
//     const doormanId = context.params.doormanId;

//     if(user != undefined){
//         // create user in firebase auth
//         admin.auth().createUser({
//             uid: doormanId,
//             email: user.email,
//             emailVerified: true,
//             password: user.password,
//             disabled: false
//         })
//         .then(()=>console.log('user created in auth'))
//         .catch(err => console.log(err))
//     }
    
// })


