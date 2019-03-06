import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';
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
})


// TODO: implement stub
export const firestoreToIOTConfig = functions.firestore.document('devices/{deviceId}/config').onUpdate((change, context) => {
  console.log(change)
  console.log(context)
})


