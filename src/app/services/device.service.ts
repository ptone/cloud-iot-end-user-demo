import { Injectable } from '@angular/core';
import { auth } from 'firebase/app';
import { AngularFirestore } from '@angular/fire/firestore';
import { AngularFireAuth } from '@angular/fire/auth';
import { AuthService } from './auth.service';
import { map } from 'rxjs/operators';
import { Observable } from 'rxjs';
import { whenRendered } from '@angular/core/src/render3';
import * as moment from 'moment';

import { Telemetry } from '../shared/types';

@Injectable({
  providedIn: 'root'
})
export class DeviceService {
  constructor(
    private afs: AngularFirestore,
    private afAuth: AngularFireAuth,
    ) {}

  devices$() {
    const user = auth().currentUser;
    return this.afs
      .collection('devices', ref => ref.where('uid', '==', user.uid))
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

  // Returns an observable of the telemetry data for a single device.
  deviceTelemetry$(deviceId: string): Observable<any> {
    return this.afs.collection(`telemetry`,
      telemetry => telemetry.where('deviceId', '==', deviceId)
      .orderBy('time', 'desc')
      .limit(30))
      .stateChanges()
      .pipe(
        map(snapshots => snapshots.map(snapshot => {
          return snapshot.payload.doc.data() as Telemetry;
        })
        .filter(data => {
          // Filter out any data that comes in with a null timestamp or a badly formatted timestamp
          const timestampIsValid = data.time && data.time.toMillis;
          return timestampIsValid && data.time.toMillis() >= moment().subtract(20, 'seconds').valueOf();
        })
      ));
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

  /**
   * @param  {string} path path to document
   *
   * Deletes document from Firestore
   **/
  delete(path) {
    return this.afs.doc(path).delete();
  }
}
