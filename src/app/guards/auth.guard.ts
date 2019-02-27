import { Injectable } from '@angular/core';
import {
  CanActivate,
  ActivatedRouteSnapshot,
  Router,
  RouterStateSnapshot
} from '@angular/router';
import { AuthService } from '../services/auth.service';
import { AlertController } from '@ionic/angular';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {
  constructor(
    private auth: AuthService,
    private alertController: AlertController,
    private router: Router
  ) {}

  async canActivate(
    next: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): Promise<boolean> {
    const uid = await this.auth.uid();
    const isLoggedIn = !!uid;
  if (isLoggedIn) {
    console.log("have user") ;
    console.log(next.url);
    if (!next.url.length) {
      this.router.navigate(['/todo']);
      return false;
    }
    if (next.url[0].path != 'todo') {
      this.router.navigate(['/todo']);
      return false;
    } else {
      return true;
    }
  }
  else {
    if (!next.url.length) {
      this.router.navigate(['/login']);
      return false;
    }
    console.log("login redirect") ;
    if (next && next.url[0].path != 'login') {
      this.router.navigate(['/login']);
      return false;
    } else {
      return true;
    }
  }
  return false;
    // if (!isLoggedIn) {

    //   const alert = await this.alertController.create({
    //     header: 'Blocked',
    //     subHeader: 'Users only',
    //     message: 'You have been blocked by the router guard...',
    //     buttons: ['OK']
    //   });

    //   await alert.present();
    // }

    // return isLoggedIn;
  }
}
