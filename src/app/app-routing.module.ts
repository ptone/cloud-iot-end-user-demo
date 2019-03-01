import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { TutorialGuard } from './guards/tutorial.guard';
import { AuthGuard } from './guards/auth.guard';

const routes: Routes = [
  {
    path: '',
    loadChildren: './home/home.module#HomePageModule',
    canActivate: [AuthGuard]
  },
  {
    path: 'device',
    loadChildren: './device/device.module#devicePageModule'
    ,
    canActivate: [AuthGuard]
  },
  { path: 'login', loadChildren: './loginpage/loginpage.module#LoginpagePageModule',
    canActivate: [AuthGuard]
  },
  {path: '**', redirectTo: 'login'}

];
@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule {}
