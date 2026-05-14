import { collection, doc, getDoc, getDocs, onSnapshot, setDoc, updateDoc, deleteDoc, query, where, Timestamp } from 'firebase/firestore';
import { db, auth } from './firebase';

export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    tenantId?: string | null;
    providerInfo?: {
      providerId?: string | null;
      email?: string | null;
    }[];
  }
}

export function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      tenantId: auth.currentUser?.tenantId,
      providerInfo: auth.currentUser?.providerData?.map(provider => ({
        providerId: provider.providerId,
        email: provider.email,
      })) || []
    },
    operationType,
    path
  }
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

export type Grade = 'S' | 'A' | 'B' | 'C' | 'D' | 'F' | 'P' | 'N' | 'none';

// Data Models
export interface Course {
  id: string;
  userId?: string;
  name: string;
  room: string;
  day: 'Mon' | 'Tue' | 'Wed' | 'Thu' | 'Fri';
  period: number;
  credits: number;
  category: 'common' | 'specialized' | 'related';
  semester: string; // e.g. "2024-Autumn"
  grade: Grade;
  color?: string;
  createdAt?: Timestamp;
  updatedAt?: Timestamp;
}

export interface UserProfile {
  id: string;
  studentId: string;
  name: string;
  department: string;
  year: number;
  updatedAt: Timestamp;
}
