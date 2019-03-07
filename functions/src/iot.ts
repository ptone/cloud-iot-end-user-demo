import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';
import { runInDebugContext } from 'vm';
import { DeviceManager } from './devices';

const db = admin.firestore();

export const telemetryToFirestore = functions.pubsub.topic('telemetry').onPublish(async (message, context) => {
  const { deviceId } = message.attributes;
  const buff = new Buffer( message.data, 'base64' );
  const msg = JSON.parse( buff.toString('utf-8') );

  // Write telemetry data to doc's subcollection (will work even if doc doesn't yet exist)
  await db.collection(`telemetry`).add({
    deviceId,
    ...msg
  });

  // Create device if it doesn't exist``
  const doc = await db.collection('devices').doc(deviceId).get()
  if (!doc.exists) {
    await db.collection('devices').doc(deviceId).create({
      uid: null, 
      createdAt: Date.now()
    });
  }
})

// TODO: implement stub
export const stateToFirestore = functions.pubsub.topic('settings').onPublish(async (message, context) => {
  const { deviceId } = message.attributes;
  const buff = new Buffer( message.data, 'base64' );
  const msg = JSON.parse( buff.toString('utf-8') );
  await db.doc(`devices/${deviceId}`).update({ setting: msg.setting });
})

const dm = new DeviceManager('config-demo');

exports.configUpdate = functions.firestore
  // assumes a document whose ID is the same as the deviceid
  .document('devices/{deviceId}/config')
  .onWrite(async (change: functions.Change<admin.firestore.DocumentSnapshot>, context?: functions.EventContext) => {
    if (context) {
      await dm.setAuth();
      console.log(context.params.deviceId);
      // get the new config data
      const configData = change.after.data();
      console.log('sending data', configData);
      return dm.updateConfig(context.params.deviceId, configData);
    } else {
      throw(Error("no context from trigger"));
    }
  })

