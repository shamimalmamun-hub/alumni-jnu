import {
  doc,
  getDoc,
  setDoc,
  updateDoc,
  type DocumentData,
  type DocumentReference,
} from 'firebase/firestore';
import { db } from './firebase';

function withTimeout<T>(promise: Promise<T>, ms: number): Promise<T> {
  return Promise.race([
    promise,
    new Promise<T>((_, reject) => setTimeout(() => reject(new Error('firestore-write-timeout')), ms)),
  ]);
}

const RETRY_DELAY_MS = 800;

export async function saveDocWithRetry(
  ref: DocumentReference<DocumentData>,
  data: DocumentData,
  attempts = 3,
  timeoutMs = 12000
): Promise<boolean> {
  try {
    await withTimeout(setDoc(ref, data), timeoutMs);
    return true;
  } catch (err) {
    if (attempts <= 1) {
      console.warn('Firestore write failed after retries:', err);
      return false;
    }
    await new Promise((resolve) => setTimeout(resolve, RETRY_DELAY_MS));
    return saveDocWithRetry(ref, data, attempts - 1, timeoutMs);
  }
}

export async function updateDocWithRetry(
  ref: DocumentReference<DocumentData>,
  fields: Partial<DocumentData>,
  attempts = 3,
  timeoutMs = 12000
): Promise<boolean> {
  try {
    await withTimeout(updateDoc(ref, fields), timeoutMs);
    return true;
  } catch (err) {
    if (attempts <= 1) {
      console.warn('Firestore update failed after retries:', err);
      return false;
    }
    await new Promise((resolve) => setTimeout(resolve, RETRY_DELAY_MS));
    return updateDocWithRetry(ref, fields, attempts - 1, timeoutMs);
  }
}

export async function docExists(collectionName: string, docId: string, timeoutMs = 12000): Promise<boolean> {
  try {
    const snap = await withTimeout(getDoc(doc(db, collectionName, docId)), timeoutMs);
    return snap.exists();
  } catch {
    return false;
  }
}
