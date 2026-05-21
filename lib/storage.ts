import * as ImageManipulator from 'expo-image-manipulator';
import {
  deleteObject,
  getDownloadURL,
  ref,
  uploadBytes,
} from 'firebase/storage';
import { storage } from './firebase';

async function compress(uri: string): Promise<string> {
  const result = await ImageManipulator.manipulateAsync(
    uri,
    [{ resize: { width: 1200 } }],
    { compress: 0.6, format: ImageManipulator.SaveFormat.JPEG }
  );
  return result.uri;
}

/**
 * Compresses a local image and uploads it to Firebase Storage.
 * `path` is relative to the bucket, e.g. households/<hid>/items/<id>.jpg
 */
export async function uploadPhoto(
  localUri: string,
  path: string
): Promise<string> {
  const compressedUri = await compress(localUri);
  const response = await fetch(compressedUri);
  const blob = await response.blob();
  const storageRef = ref(storage, path);
  await uploadBytes(storageRef, blob);
  return getDownloadURL(storageRef);
}

export async function deletePhoto(path: string): Promise<void> {
  try {
    await deleteObject(ref(storage, path));
  } catch {
    // Ignore: the photo may already be gone.
  }
}

export function itemPhotoPath(householdId: string, itemId: string): string {
  return `households/${householdId}/items/${itemId}.jpg`;
}

export function containerPhotoPath(
  householdId: string,
  containerId: string
): string {
  return `households/${householdId}/containers/${containerId}.jpg`;
}
