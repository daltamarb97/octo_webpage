import { Component } from '@angular/core';
import { Router } from '@angular/router';

import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: []
})
export class AppHeaderComponent {

  constructor(
    private router: Router,
    // services
    private authService: AuthService
  ){}


  logOut(){
    // logging out and redirecting to login
    this.authService.logOut()
    .then(()=>{
      this.router.navigate(['/auth/login']);
    });
  }


  goToProfile(){
    // take user to their profile page
    this.router.navigate(['perfil']);
  }
}
