import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { DeviceService } from '../../services/device.service';

@Component({
  selector: 'app-settings',
  templateUrl: './device-settings.component.html',
  styleUrls: ['./device-settings.component.scss']
})
export class DeviceSettingsComponent implements OnInit {
  canBeUpdated$;

  constructor(private route: ActivatedRoute, private deviceService: DeviceService) { }

  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id');
    this.canBeUpdated$ = this.deviceService.deviceCanBeUpdated$(`devices/${id}`);
  }

}
