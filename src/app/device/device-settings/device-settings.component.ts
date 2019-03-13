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
  tempSetting;
  errorDisplay: string;
  device;

  constructor(private route: ActivatedRoute, private deviceService: DeviceService) { }

  ngOnInit() {
    const deviceId = this.route.snapshot.paramMap.get('id');
    this.deviceService.getDocument('devices/' + deviceId).then(doc => {
      this.device = doc.data();
      this.tempSetting = doc.data()['setting'] ? doc.data()['setting'] : { lower: 0, upper: 70 };
    });

    // Determine whether or not update button should be greyed out
    this.deviceService.deviceCanBeUpdated$(deviceId).subscribe(val => {
      this.updateDisabled = !val;
    });
  }

  updateConfig() {
    this.deviceService.updateConfig(this.device.deviceId, this.tempSetting).then(() => {
      // Successfully updated
      this.errorDisplay = "";
    }, err => {
      this.errorDisplay = err;
    });
  }

}
