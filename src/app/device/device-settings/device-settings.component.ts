import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { DeviceService } from '../../services/device.service';

@Component({
  selector: 'app-settings',
  templateUrl: './device-settings.component.html',
  styleUrls: ['./device-settings.component.scss']
})
export class DeviceSettingsComponent implements OnInit {
  updateDisabled: boolean;

  constructor(private route: ActivatedRoute, private deviceService: DeviceService) { }

  ngOnInit() {
    const deviceId = this.route.snapshot.paramMap.get('id');

    this.deviceService.deviceCanBeUpdated$(deviceId).subscribe(val => {
      this.updateDisabled = !val;
    });
  }

}
