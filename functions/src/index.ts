//UNCOMMENT AND DEPLOY WHEN LAUNCHING PRODUCTION

import * as functions from 'firebase-functions'
import * as admin from 'firebase-admin';
import * as nodemailer from 'nodemailer';

admin.initializeApp(functions.config().firebase);


const SENDER_EMAIL= '*****';
const SENDER_PASSWORD= '******';


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
