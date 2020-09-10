import { NgModule } from '@angular/core';
import { Routes, RouterModule, PreloadAllModules } from '@angular/router';

import { FullComponent } from './layouts/full/full.component';
import { NotfoundComponent } from './notfound/notfound.component';

// guards
import {  EmailVerifiedGuardService } from './core/guards/email-verified.service';
import { CurrentUserGuard } from './core/guards/current-user-guard.service';
import { UserinfoGuard } from './core/guards/userinfo.guard';


export const AppRoutes: Routes = [
  {
    path: '',
    component: FullComponent,
    children: [
      {
        path: '',
        redirectTo: '/inicio',
        pathMatch: 'full'
      },
      {
        path: '',
        canActivate: [
          UserinfoGuard
        ],
        loadChildren: 
          () => import('./material-component/material.module').then(m => m.MaterialComponentsModule)
      },
      {
        path: 'inicio',
        canActivate: [
          CurrentUserGuard,
          EmailVerifiedGuardService,
          UserinfoGuard,
        ],
        loadChildren:
          () => import('./dashboard/dashboard.module').then(m => m.DashboardModule)
      },
      {
        path: 'no-comp',
        canActivate: [
          CurrentUserGuard,
          EmailVerifiedGuardService,
          UserinfoGuard,
        ],
        loadChildren:
          () => import('./no-comp/no-comp.module').then(m => m.NoCompModule)
      },
      {
        path: 'canales-comunicacion',
        canActivate: [
          CurrentUserGuard,
          EmailVerifiedGuardService,
          UserinfoGuard,
          
        ],
        loadChildren:
          () => import('./comunications/comunications.module').then(m => m.ComunicationsModule)
      },
      {
        path: 'whatsapp',
        canActivate: [
          CurrentUserGuard,
          EmailVerifiedGuardService,
          UserinfoGuard,
          
        ],
        loadChildren:
          () => import('./whatsapp/whatsapp.module').then(m => m.WhatsappComponentModule)
      },
      {
        path: 'tareas',
        canActivate: [
          CurrentUserGuard,
          EmailVerifiedGuardService,
          UserinfoGuard,
          
        ],
        loadChildren:
          () => import('./board/board.module').then(m => m.BoardModule)
      }, 
      {
        path: 'directorio',
        canActivate: [
          CurrentUserGuard,
          EmailVerifiedGuardService,
          UserinfoGuard,
          
        ],
        loadChildren:
          () => import('./directory/directory.module').then(m => m.DirectoryModule)
      },
      {
        path: 'perfil',
        canActivate: [
          CurrentUserGuard,
          EmailVerifiedGuardService,
          UserinfoGuard,
          
        ],
        loadChildren:
          () => import('./profile/profile.module').then(m => m.ProfileModule)
      },
      {
        path: 'tags',
        canActivate: [
          CurrentUserGuard,
          EmailVerifiedGuardService,
          UserinfoGuard,
          
        ],
        loadChildren:
          () => import('./tags/tags.module').then(m => m.TagsModule)
      },
      {
        path: 'tag-metrics',
        canActivate: [
          CurrentUserGuard,
          EmailVerifiedGuardService,
          UserinfoGuard,
          
        ],
        loadChildren:
          () => import('./tag-metrics/tag-metrics.module').then(m => m.TagMetricsModule)
      },
    ]
  },
  {
    path: 'auth',
    loadChildren:
      () => import('./auth/auth.module').then(m => m.AuthModule)
  },
  {
    path: '**',
    component: NotfoundComponent
  },
];


@NgModule({
  imports: [RouterModule.forRoot(AppRoutes, {
    preloadingStrategy: PreloadAllModules
  })],
  exports: [RouterModule]
})
export class AppRoutingModule { }
