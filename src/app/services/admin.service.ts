import { Injectable } from '@angular/core';
import { AngularFirestore } from '@angular/fire/firestore';
import { DbService } from '../services/db.service';


@Injectable({
    providedIn: 'root'
})
export class AdminService {
    constructor(
        private afs: AngularFirestore,
        private dbService: DbService,
    ) { }


    allDevices$() {
        return this.dbService.collection$('devices')
    }
}
