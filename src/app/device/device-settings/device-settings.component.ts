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
  tempSetting = { lower: 0, upper: 0 };
  device;

  constructor(private route: ActivatedRoute, private deviceService: DeviceService) { }

  ngOnInit() {
    const deviceId = this.route.snapshot.paramMap.get('id');
    this.deviceService.getDocument('devices/' + deviceId).then(doc => {
      console.log('get doc');
      console.log(doc.data());
      this.device = doc.data();
      this.tempSetting = doc.data()['setting'];
    });

    // Determine whether or not update button should be greyed out
    this.deviceService.deviceCanBeUpdated$(deviceId).subscribe(val => {
      this.updateDisabled = !val;
    });
  }

  updateConfig() {
    console.log(this.tempSetting);
    console.log(this.device.deviceId);
    this.deviceService.updateConfig(this.device.deviceId, this.tempSetting).then(() => {
      console.log('success');
    });
  }

}
