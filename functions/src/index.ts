import * as admin from 'firebase-admin';
admin.initializeApp();

export {
  subscribeToTopic,
  unsubscribeFromTopic,
  sendOnFirestoreCreate
} from './fcm';

export {
  telemetryToFirestore,
  stateToFirestore,
  configUpdate
} from './iot';