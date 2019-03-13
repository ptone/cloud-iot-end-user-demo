import { Timestamp } from '@firebase/firestore-types';

// Figured we could keep a types file of shared types
export interface Telemetry {
  time: Timestamp;
  light: number;
  temp: number;
}