import { Injectable } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/auth';


@Injectable({
  providedIn: 'root'
})
export class AuthService {
  
  userInfo:any;  // User info global variable

  constructor(
    private afa: AngularFireAuth
  ) { }

  signUp(email: string, password: string){
    // user registration in firebase
    return this.afa.createUserWithEmailAndPassword(email, password)
    .then((result)=>{
      const newUser = result;
      // send verification email
      newUser.user.sendEmailVerification()
      .then(()=>{
        console.log('email verification sent');
      }) 
    })
  }


  logIn(email: string, password: string){
    // user login with firebase auth
    return this.afa.signInWithEmailAndPassword(email, password);
  }

  resetPassword(email:string){
    // resetting forgotten password
    return this.afa.sendPasswordResetEmail(email);
  }


  getCurrentUser(){
    return this.afa.authState;
  }

  
  logOut(){
    return this.afa.signOut();
  }


  // PROFILE SERVICES

  checkIfDoormanEmailExists(email){
    // check if a doorman account already exists
    return this.afa.fetchSignInMethodsForEmail(email);
  }
  // END OF PROFILE SERVICES

}
