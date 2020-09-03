//UNCOMMENT AND DEPLOY WHEN LAUNCHING PRODUCTION

import * as functions from 'firebase-functions'
import * as admin from 'firebase-admin';
import * as nodemailer from 'nodemailer';

admin.initializeApp(functions.config().firebase);


const SENDER_EMAIL= 'waypooltec@gmail.com';
const SENDER_PASSWORD= 'Waypooltec2020';



// function that sends invite email in response of an event triggered by host user
exports.sendInviteEmail = functions.firestore
    .document('invites/{inviteId}')
    .onCreate((snapshot, context)=>{
        const data: any = snapshot.data();
        const inviteId: string = context.params.inviteId;

        // email Logic stated here
        const authData = nodemailer.createTransport({
            host: 'smtp.gmail.com',
            port: 587,
            secure: false,
            auth: {
                user: SENDER_EMAIL,
                pass: SENDER_PASSWORD
            }
        });

        authData.sendMail({
            from: 'info@octo.com',
            to: data.guestEmail,
            subject: `¡Únete al espacio de trabajo de ${data.company} en Octo!`,
            // text: `Para registrarte solo debes ingresar el siguiente código de invitación en el campo 'código de invitación' el cual está en el formulario de registro de nuestra plataforma web. CODIGO DE INVITACIÓN: ${inviteId}. RECUERDA NO COMPARTIR ESTE CÓDIGO CON NADIE`,
            html: `<h1>¡Únete al espacio de trabajo de ${data.company} en Octo!</h1>
                    <br>
                    <h3>Para registrarte solo debes ingresar el siguiente código de invitación en el campo 'código de invitación' el cual está en el formulario de registro de Octo Web. 
                        <br>
                        <br>
                        CODIGO DE INVITACIÓN: <span style="color: red;">${inviteId}</span>  
                        <br>
                        <br>
                        RECUERDA NO COMPARTIR ESTE CÓDIGO CON NADIE
                        <br>
                        Página web: https://octo-work.web.app/
                    </h3>`
        }).then((res)=>{
            console.log('successfully sent email:' + res);
        }).catch(error =>{
            console.log('error has raised and it is: ' + error); 
        });

    })


exports.sendPushNot = functions.firestore
    .document('chats/{companyId}/rooms/{roomId}/messages/{messageId}')
    .onCreate(async (snapshot, context) => {
        const message: any = snapshot.data();
        const roomId = context.params.roomId;
        const companyId = context.params.companyId;  

        const payload = {
            notification: {
                title: 'Nuevo Mensaje en Octo',
                body: message.message
            }
        }
  
        const participants = await admin.firestore()
            .collection('chats')
            .doc(companyId)
            .collection('rooms')
            .doc(roomId)
            .collection('participants')
            .get();

            participants.forEach(async (p) => {
                try {
                    const dataUser: any = await admin.firestore().collection('users').doc(p.id).get();
                    const token = dataUser.data().token;
                    await admin.messaging().sendToDevice(token, payload)
                } catch(error) {
                    console.error('error sending push not: ', error);
                }
            })

    })


exports.sendTestRequestLanding = functions.https
.onRequest(async (req, res) => {
    const data = {
        name: req.body.name,
        email: req.body.email,
        phone: req.body.phone
    }

     // email Logic stated here
     const authData = nodemailer.createTransport({
        host: 'smtp.gmail.com',
        port: 587,
        secure: false,
        auth: {
            user: SENDER_EMAIL,
            pass: SENDER_PASSWORD
        }
    });

    authData.sendMail({
        from: 'landing@octo.com',
        to: 'octo-work@criptext.com',
        subject: `Requerimiento de prueba desde la landing page`,
        text: `Información del solicitante: nombre: ${data.name} / email: ${data.email} / telefono: ${data.phone}`,
    }).then((response)=>{
        console.log('successfully sent email:' + response);
        res.end();
    }).catch(error =>{
        console.log('error has raised and it is: ' + error); 
        res.end();
    });

})


exports.sendTestRequestLandingContact = functions.https
.onRequest(async (req, res) => {
    const data = {
        name: `${req.body.name} ${req.body.lastname}`,
        email: req.body.email,
        phone: req.body.phone,
        message: req.body.message
    }

     // email Logic stated here
     const authData = nodemailer.createTransport({
        host: 'smtp.gmail.com',
        port: 587,
        secure: false,
        auth: {
            user: SENDER_EMAIL,
            pass: SENDER_PASSWORD
        }
    });

    authData.sendMail({
        from: 'landing@octo.com',
        to: 'octo-work@criptext.com',
        subject: `Contacto desde landing page - contact page`,
        text: `Información del solicitante: nombre: ${data.name} / email: ${data.email} / telefono: ${data.phone} / mensaje: ${data.message}`,
    }).then((response)=>{
        console.log('successfully sent email:' + response);
        res.end();
    }).catch(error =>{
        console.log('error has raised and it is: ' + error); 
        res.end();
    });

})