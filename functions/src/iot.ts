import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';
import { runInDebugContext } from 'vm';
import { DeviceManager } from './devices';
const db = admin.firestore();
const IOT_REGISTRY = 'end-user-demo';
const dm = new DeviceManager(IOT_REGISTRY);


export const telemetryToFirestore = functions.pubsub.topic('telemetry').onPublish(async (message, context) => {
  const { deviceId } = message.attributes;
  const buff = new Buffer( message.data, 'base64' );
  const msg = JSON.parse( buff.toString('utf-8') );

  // 1 Use server time if no time is sent from device
  // 2 stringifying a JSON object with a date field makes the date a string. 
  // we need to explicitly "dateify" the field after parsing back to JSON
  const time = msg.time ? new Date(msg.time) : new Date();

  try {
    await db.collection(`telemetry`).add({
      ...msg,
      deviceId,
      time
    });
    const doc = await db.collection('devices').doc(deviceId).get()
    if (!doc.exists) {
      await db.collection('devices').doc(deviceId).create({
        uid: null, 
        createdAt: new Date()
      });
    }
  } catch(err) {
    console.error(err);
    throw new Error(err);
  }
})

export const stateToFirestore = functions.pubsub.topic('settings').onPublish(async (message, context) => {
  const { deviceId } = message.attributes;
  const buff = new Buffer( message.data, 'base64' );
  const msg = JSON.parse( buff.toString('utf-8') );
  try {
    await db.doc(`devices/${deviceId}`).update({ setting: msg.setting });
  } catch(err) {
    console.error(err);
    throw new Error(err);
  }
})


export const configUpdate = functions.firestore
  .document('device-configs/{deviceId}')
  .onWrite(async (change: functions.Change<admin.firestore.DocumentSnapshot>, context?: functions.EventContext) => {
    if (context) {
      await dm.setAuth();
      console.log(context.params.deviceId);
      const configData = change.after.data();
      return dm.updateConfig(context.params.deviceId, configData);
    } else {
      throw(Error("no context from trigger"));
    }
  })


