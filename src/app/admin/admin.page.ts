import { Component, OnInit } from '@angular/core';
import { AuthService } from '../services/auth.service';
import { map } from 'rxjs/operators';
import { AdminService } from '../services/admin.service';
import { combineLatest } from 'rxjs';
import { DeviceService } from '../services/device.service';

@Component({
    selector: 'app-admin',
    templateUrl: './admin.page.html',
    styleUrls: ['./admin.page.scss']
})
export class AdminPage implements OnInit {
    devices;
    users;
    deviceWithUsers;

    constructor(
        public adminService: AdminService,
        public deviceService: DeviceService,
        public auth: AuthService
    ) { }

    ngOnInit() {
        this.devices = this.adminService.allDevices$();
        this.users = this.adminService.allUsers$();

        const joinArrays = (devices, users) =>
            devices.map(device => Object.assign({}, device, { userDisplayName: findUserByUid(users, device.uid).displayName }));

        const findUserByUid = (users, uid) =>
            users.find(user => user.uid === uid) || { userDisplayName: '' };

        this.deviceWithUsers = combineLatest(this.devices, this.users).pipe(map(([devices, users]) => joinArrays(devices, users))
        )

    }

    releaseDevice(device) {
        // this.deviceService.deleteDocument('device-configs/' + device.id).then(() => {
        this.deviceService.releaseDevice(device.id);
        // });
    }


}
