import { Injectable } from '@angular/core';
import { auth } from 'firebase/app';
import { AngularFirestore } from '@angular/fire/firestore';
import { AngularFireAuth } from '@angular/fire/auth';
import { AuthService } from './auth.service';
import { map } from 'rxjs/operators';
import { Observable } from 'rxjs';
import { whenRendered } from '@angular/core/src/render3';
import { DbService } from '../services/db.service';
import { promise } from 'selenium-webdriver';
import { userInfo } from 'os';
import { reject } from 'q';
import * as moment from 'moment';
import { Telemetry } from '../shared/types';


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
    // Check first to see if device exists / is already attached to this account
    return this._deviceCanBeAdded(device, data).then(() => {
      return this.dbService.updateDoc('devices/' + device, data).then(() => {
        this.dbService.updateDoc('device-configs/' + device, { claimed: true })
      }, err => {
        // We are only getting here if the device does not exist
        if (String(err).includes("insufficient permissions")) {
          return Promise.reject('Invalid Device')
        }
      })
    }, err => {

      return Promise.reject(err);
    });
  }

  // Check if a device can be added.
  // Rejects if the device exists and is already attached to this account
  // Resolves in all other cases (Device does not exist, exists but is attached to another account, exists but UID is null)
  private _deviceCanBeAdded(device: string, data: object): Promise<string> {
    let t = this;
    return new Promise(function (resolve, reject) {
      t.dbService.getDocument('devices/' + device).then(doc => {
        if (!doc.exists) {
          reject('Error: Device does not exist');
        } else if (data['uid'] == doc.data()['uid']) {
          reject('Error: Device already attached to this account');
        }
        resolve();
      }, err => {

        // Expected error on read even if the Device exists but the UID is empty
        resolve();
      }).catch(err => {
        // Expected error on read even if the Device exists but the UID is empty
        resolve();
      })
    });
  };


  // Observe both device and device-config, return whether or not they match
  // Returns true (can be updated) if the field is not present on both objects
  deviceCanBeUpdated$(deviceId: string): Observable<boolean> {
    let configSentToDevice;
    // Default settings
    let deviceConfig = { lower: 0, upper: 70 };
    let t = this;

    const observable = new Observable<boolean>(observer => {


      t.dbService.doc$('devices/' + deviceId).subscribe(val => {
        deviceConfig = val['setting'];
        observer.next(this._uninitializedOrEqual(configSentToDevice, deviceConfig));
      });

      t.dbService.doc$('device-configs/' + deviceId).subscribe(val => {
        configSentToDevice = val['setting'];
        observer.next(this._uninitializedOrEqual(configSentToDevice, deviceConfig));
      });

    });

    return observable;
  }

  // Determines if Device can be updated
  // Allows updates if any of the config fields are uninitialized/null
  private _uninitializedOrEqual(configSentToDevice, deviceConfig) {
    if (configSentToDevice == null || !('lower' in configSentToDevice) || !('upper' in configSentToDevice)) {
      return true
    }
    if (deviceConfig == null || !('lower' in deviceConfig) || !('upper' in deviceConfig)) {
      return false
    }
    return (configSentToDevice['lower'] == deviceConfig['lower'] && configSentToDevice['upper'] == deviceConfig['upper'])
  }


  /**
   * @param  {string} path path to document
   *
   * Deletes document from Firestore
   **/
  deleteDocument(path: string) {
    return this.dbService.delete(path);
  }

  /**
   * @param  {string} device deviceID
   *
   * Clears device UID and settings
   **/
  releaseDevice(device: string) {
    return this.dbService.updateDoc('device-configs/' + device, { claimed: false }).then(() => {
      this.dbService.updateDoc('devices/' + device, { uid: '' });
    })
  }

  getDocument(path: string): Promise<any> {
    return this.dbService.getDocument(path);
  }

  updateConfig(device: string, data: object): Promise<any> {
    return this.dbService.updateAt('device-configs/' + device, { setting: data });
  }

  /*
  updateStatus(device: string, data: Object) {
    this.dbService.updateAt(device, data);
  }
  */

  getDevicesByUid(uid: string): Observable<any> {
    return this.dbService.collection$('devices', ref =>
      ref
        .where('uid', '==', uid)
        // .orderBy('createdAt', 'desc')
        .limit(25)
    )
  }
}
