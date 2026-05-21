import * as ImageManipulator from 'expo-image-manipulator';
import { cloudinaryConfig, isCloudinaryConfigured } from './cloudinaryConfig';

async function compress(uri: string): Promise<string> {
  const result = await ImageManipulator.manipulateAsync(
    uri,
    [{ resize: { width: 1200 } }],
    { compress: 0.6, format: ImageManipulator.SaveFormat.JPEG }
  );
  return result.uri;
}

/**
 * Compresses a local image and uploads it to Cloudinary via an unsigned
 * upload preset. Returns the hosted https URL to store on the item/container.
 */
export async function uploadPhoto(localUri: string): Promise<string> {
  if (!isCloudinaryConfigured) {
    throw new Error(
      'Photo hosting is not set up yet. Add your Cloudinary details to lib/cloudinaryConfig.ts.'
    );
  }

  const compressedUri = await compress(localUri);

  const formData = new FormData();
  formData.append('file', {
    uri: compressedUri,
    type: 'image/jpeg',
    name: 'photo.jpg',
  } as unknown as Blob);
  formData.append('upload_preset', cloudinaryConfig.uploadPreset);

  const endpoint = `https://api.cloudinary.com/v1_1/${cloudinaryConfig.cloudName}/image/upload`;

  let response: Response;
  try {
    response = await fetch(endpoint, { method: 'POST', body: formData });
  } catch {
    throw new Error(
      'Could not reach the photo server. Check your connection and try again.'
    );
  }

  const data = (await response.json().catch(() => null)) as
    | { secure_url?: string; error?: { message?: string } }
    | null;

  if (!response.ok || !data?.secure_url) {
    const reason = data?.error?.message ?? `HTTP ${response.status}`;
    throw new Error(`Photo upload failed: ${reason}`);
  }
  return data.secure_url;
}
