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
        redirectTo: '/whatsapp',
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
        path: 'tickets',
        canActivate: [
          CurrentUserGuard,
          EmailVerifiedGuardService,
          UserinfoGuard,
        ],
        loadChildren:
          () => import('./tickets/tickets.module').then(m => m.TicketsModule)
      },
      {
        path: 'forms',
        canActivate: [
          CurrentUserGuard,
          EmailVerifiedGuardService,
          UserinfoGuard,
        ],
        loadChildren:
          () => import('./forms/forms.module').then(m => m.FormModule)
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
      {
        path: 'pedidos',
        canActivate: [
          CurrentUserGuard,
          EmailVerifiedGuardService,
          UserinfoGuard,   
        ],
        loadChildren:
          () => import('./orders/orders.module').then(m => m.OrdersModule)
      },
      {
        path: 'statistics',
        canActivate: [
          CurrentUserGuard,
          EmailVerifiedGuardService,
          UserinfoGuard,   
        ],
        loadChildren:
          () => import('./statistics/statistics.module').then(m => m.StatisticsModule)
      },
      {
        path: 'orderdetails',
        canActivate: [
          CurrentUserGuard,
          EmailVerifiedGuardService,
          UserinfoGuard,   
        ],
        loadChildren:
          () => import('./orderdetails/orderdetails.module').then(m => m.OrderdetailsModule)
      },
      
      {
        path: 'chat-flow',
        canActivate: [
          CurrentUserGuard,
          EmailVerifiedGuardService,
          UserinfoGuard,   
        ],
        loadChildren:
          () => import('./chat-flow/chat-flow.module').then(m => m.ChatFlowModule)
      }
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
