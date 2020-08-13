import { Routes } from '@angular/router';

import { DashboardComponent } from './dashboard.component';
import { UserTableProfileComponent } from './user-table-profile/user-table-profile.component';


export const DashboardRoutes: Routes = [{
  path: '',  
  component: DashboardComponent
}, 
{
  path: ':rowId', 
  component: UserTableProfileComponent
},
];
