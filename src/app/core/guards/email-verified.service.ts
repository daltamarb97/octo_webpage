import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, UrlTree, Router } from '@angular/router';
import { Observable } from 'rxjs';
import { map, tap } from 'rxjs/operators';

import { AuthService } from '../services/auth.service';

@Injectable({
  providedIn: 'root'
})


export class EmailVerifiedGuardService implements CanActivate {

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  
  canActivate(
    next: ActivatedRouteSnapshot,
    state: RouterStateSnapshot): Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree {
    return this.authService.getCurrentUser().pipe(
      map(user => user.emailVerified === true ? true : false),
      tap(emailVerified => {
        if (!emailVerified) {
          this.router.navigate(['/auth/login']);
        }
      })
    )
  }

}




