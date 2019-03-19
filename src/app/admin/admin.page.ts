import { Component, OnInit } from '@angular/core';
import { AuthService } from '../services/auth.service';

import { AdminService } from '../services/admin.service';

@Component({
    selector: 'app-admin',
    templateUrl: './admin.page.html',
    styleUrls: ['./admin.page.scss']
})
export class AdminPage implements OnInit {
    devices;

    constructor(
        public adminService: AdminService,
        public auth: AuthService
    ) { }

    ngOnInit() {
        console.log('admin page');
        this.devices = this.adminService.allDevices$();
    }
}
