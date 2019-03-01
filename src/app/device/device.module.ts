import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { Routes, RouterModule } from '@angular/router';

import { IonicModule } from '@ionic/angular';

import { devicePage } from './device.page';
import { deviceFormComponent } from './device-form/device-form.component';
import { deviceDetailComponent } from './device-detail/device-detail.component';

const routes: Routes = [
  {
    path: '',
    component: devicePage
  },
  {
    path: ':id',
    component: deviceDetailComponent
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
  declarations: [devicePage, deviceFormComponent, deviceDetailComponent],
  entryComponents: [deviceFormComponent]
})
export class devicePageModule {}
