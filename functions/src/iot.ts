import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';
import { runInDebugContext } from 'vm';
import { DeviceManager } from './devices';

const db = admin.firestore();

export const telemetryToFirestore = functions.pubsub.topic('telemetry').onPublish(async (message, context) => {
  const { deviceId } = message.attributes;
  const buff = new Buffer( message.data, 'base64' );
  const msg = JSON.parse( buff.toString('utf-8') );

  // TODO: make this generic enough to accept any telemetry data?
  if (!(msg.hasOwnProperty('light') && msg.hasOwnProperty('temp'))) {
    throw new Error('Message does not contain fields light or temp');
  }

  console.log('Received message from', deviceId);
  console.log('message', msg);

  // Write telemetry data to doc's subcollection (will work even if doc doesn't yet exist)
  const now = Date.now();
  await db.collection(`devices/${deviceId}/telemetry`).add({
    time: now,
    light: msg.light,
    temp: msg.temp
  });

  // Create device if it doesn't exist
  const doc = await db.collection('devices').doc(deviceId).get()
  if (!doc.exists) {
    await db.collection('devices').doc(deviceId).set({
      uid: null, 
      createdAt: now
    });
  }
})

// TODO: implement stub
export const stateToFirestore = functions.pubsub.topic('state').onPublish(async (message, context) => {
  const { deviceId } = message.attributes;
  console.log('message', message, deviceId);
  const buff = new Buffer( message.data, 'base64' );
  const msg = JSON.parse( buff.toString('utf-8') );
  console.log(msg);
  await db.doc(`devices/${deviceId}/state`).set(msg);
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


