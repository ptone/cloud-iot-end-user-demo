import { Component, OnInit } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { AuthService } from '../services/auth.service';

import { ModalController } from '@ionic/angular';
import { DeviceService } from '../services/device.service';

@Component({
    selector: 'app-admin',
    templateUrl: './admin.page.html',
    styleUrls: ['./admin.page.scss']
})
export class AdminPage implements OnInit {
    devices;
    filtered;

    filter = new BehaviorSubject(null);

    constructor(
        public deviceService: DeviceService,
        public modal: ModalController,
        public auth: AuthService
    ) { }

    ngOnInit() {
        console.log('admin page');

    }
}
