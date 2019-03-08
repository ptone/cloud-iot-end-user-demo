import { Injectable } from '@angular/core';
import { auth } from 'firebase/app';
import { AngularFirestore } from '@angular/fire/firestore';
import { AngularFireAuth } from '@angular/fire/auth';
import { AuthService } from './auth.service';
import { map } from 'rxjs/operators';
import { Observable } from 'rxjs';
import { whenRendered } from '@angular/core/src/render3';
import { DbService } from '../services/db.service';

@Injectable({
  providedIn: 'root'
})
export class DeviceService {
  constructor(
    private afs: AngularFirestore,
    private afAuth: AngularFireAuth,
    private auth: AuthService,
    private dbService: DbService,
  ) { }

  devices$() {
    var user = auth().currentUser;
    console.log('Current User UID: ' + user.uid);
    return this.afs
      .collection("devices", ref => ref.where('uid', '==', user.uid))
      .snapshotChanges()
      .pipe(
        map(actions => {
          return actions.map(a => {
            const data: Object = a.payload.doc.data();
            const id = a.payload.doc.id;
            return { id, ...data };
          });
        })
      );
  }

  doc$(path): Observable<any> {
    return this.afs
      .doc(path)
      .snapshotChanges()
      .pipe(
        map(doc => {
          return { id: doc.payload.id, ...doc.payload.data() };
        })
      );
  }

  /**
   * @param  {string} path 'collection' or 'collection/docID'
   * @param  {object} data new data
   *
   * Creates or updates data on a collection or document.
   **/
  // Commenting out because redundant
  /*
  updateAt(path: string, data: Object): Promise<any> {
    const segments = path.split('/').filter(v => v);
    if (segments.length % 2) {
      // Odd is always a collection
      return this.afs.collection(path).add(data);
    } else {
      // Even is always document
      return this.afs.doc(path).set(data, { merge: true });
    }
  }
  */

  addDevice(device: string, data: object): Promise<any> {
    console.log('device.service.ts addDevice');
    console.log(device + ' | ' + JSON.stringify(data));
    return this.dbService.updateDoc(device, data);
  }

  /**
   * @param  {string} path path to document
   *
   * Deletes document from Firestore
   **/
  deleteDevice(path: string) {
    return this.dbService.delete(path);
  }

  updateStatus(device: string, data: Object) {
    this.dbService.updateAt(device, data);
  }

  getDevicesByUid(uid: string) {
    return this.dbService.collection$('devices', ref =>
      ref
        .where('uid', '==', uid)
        // .orderBy('createdAt', 'desc')
        .limit(25)
    )
  }
}
