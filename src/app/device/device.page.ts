import { Component, OnInit } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { switchMap, map, shareReplay } from 'rxjs/operators';
import { DbService } from '../services/db.service';
import { AuthService } from '../services/auth.service';

import { ModalController } from '@ionic/angular';
import { DeviceFormComponent } from './device-form/device-form.component';
import { Observable } from 'rx';

@Component({
  selector: 'app-device',
  templateUrl: './device.page.html',
  styleUrls: ['./device.page.scss']
})
export class DevicePage implements OnInit {
  devices;
  filtered;

  filter = new BehaviorSubject(null);

  constructor(
    public db: DbService,
    public modal: ModalController,
    public auth: AuthService
  ) {}

  ngOnInit() {
    this.devices = this.auth.user$.pipe(
      switchMap(user =>
        this.db.collection$('devices', ref =>
          ref
            .where('uid', '==', user.uid)
            // .orderBy('createdAt', 'desc')
            .limit(25)
        )
      ),
      shareReplay(1)
    );

    this.filtered = this.filter.pipe(
      switchMap(status => {
        return this.devices.pipe(
          map(arr =>
            (arr as any[]).filter(
              obj => (status ? obj.status === status : true)
            )
          )
        );
      })
    );
  }

  deletedevice(device) {
    this.db.delete(`devices/${device.id}`);
  }

  toggleStatus(device) {
    const status = device.status === 'complete' ? 'pending' : 'complete';
    this.db.updateAt(`devices/${device.id}`, { status });
  }

  updateFilter(val) {
    this.filter.next(val);
  }

  async presentdeviceForm(device?: any) {
    const modal = await this.modal.create({
      component: DeviceFormComponent,
      componentProps: { device }
    });
    return await modal.present();
  }

  trackById(idx, device) {
    return device.id;
  }
}
