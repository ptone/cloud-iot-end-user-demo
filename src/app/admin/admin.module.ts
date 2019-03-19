import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Routes, RouterModule } from '@angular/router';

import { IonicModule } from '@ionic/angular';

import { AdminPage } from './admin.page';
import { SharedModule } from '../shared/shared.module';

const routes: Routes = [
    {
        path: '',
        component: AdminPage
    }
];

@NgModule({
    imports: [
        CommonModule,
        IonicModule,
        RouterModule.forChild(routes),
        SharedModule
    ],
    declarations: [AdminPage],
    entryComponents: []
})
export class AdminPageModule { }
