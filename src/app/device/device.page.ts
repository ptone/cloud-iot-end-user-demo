import { Component, OnInit } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { switchMap, map, shareReplay } from 'rxjs/operators';
import { DbService } from '../services/db.service';
import { AuthService } from '../services/auth.service';

import { ModalController } from '@ionic/angular';
import { deviceFormComponent } from './device-form/device-form.component';
import { Observable } from 'rx';
import { DeviceService } from '../services/device.service';

@Component({
  selector: 'app-device',
  templateUrl: './device.page.html',
  styleUrls: ['./device.page.scss']
})
export class devicePage implements OnInit {
  devices;
  filtered;

  filter = new BehaviorSubject(null);

  constructor(
    public dbService: DbService,
    public deviceService: DeviceService,
    public modal: ModalController,
    public auth: AuthService
  ) { }

  ngOnInit() {
    console.log('uid');
    this.devices = this.auth.user$.pipe(
      switchMap(user =>
        this.deviceService.getDevicesByUid(user.uid)
        /*
        this.dbService.collection$('devices', ref =>
          ref
            .where('uid', '==', user.uid)
            // .orderBy('createdAt', 'desc')
            .limit(25)
        )
        */
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
    this.deviceService.deleteDevice(`devices/${device.id}`);
  }

  updateStatus(device) {
    const status = device.status === 'complete' ? 'pending' : 'complete';
    this.deviceService.updateStatus(`devices/${device.id}`, { status });
  }

  updateFilter(val) {
    this.filter.next(val);
  }

  // Called when Add Device button click
  async presentdeviceForm(device?: any) {
    const modal = await this.modal.create({
      component: deviceFormComponent,
      componentProps: { device }
    });
    return await modal.present();
  }

  trackById(idx, device) {
    return device.id;
  }
}
