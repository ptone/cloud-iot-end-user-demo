import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { Routes, RouterModule } from '@angular/router';

import { IonicModule } from '@ionic/angular';

import { DevicePage } from './device.page';
import { DeviceFormComponent } from './device-form/device-form.component';
import { DeviceDetailComponent } from './device-detail/device-detail.component';

const routes: Routes = [
  {
    path: '',
    component: DevicePage
  },
  {
    path: ':id',
    component: DeviceDetailComponent
  }
];

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    RouterModule.forChild(routes),
    ReactiveFormsModule
  ],
  declarations: [DevicePage, DeviceFormComponent, DeviceDetailComponent],
  entryComponents: [DeviceFormComponent]
})
export class DevicePageModule {}
