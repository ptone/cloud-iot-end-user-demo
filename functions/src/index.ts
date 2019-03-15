import * as admin from 'firebase-admin';
admin.initializeApp();


export {
  telemetryToFirestore,
  stateToFirestore,
  configUpdate
} from './iot';