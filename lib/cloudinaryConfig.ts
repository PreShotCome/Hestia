// ---------------------------------------------------------------------------
// Cloudinary hosts item and container photos (free tier, no billing needed).
//
// Setup:
//   1. Create a free account at https://cloudinary.com
//   2. On the dashboard, copy your "Cloud name".
//   3. Create an unsigned upload preset:
//      Settings (gear) -> Upload -> Upload presets -> Add upload preset
//      -> set Signing Mode to "Unsigned" -> Save. Copy the preset name.
//   4. Paste both values below and reload the app.
//
// These values are not secret; unsigned upload presets are designed to be
// used directly from client apps.
// ---------------------------------------------------------------------------

export const cloudinaryConfig = {
  cloudName: 'drok0grxp',
  uploadPreset: 'hestia',
};

export const isCloudinaryConfigured =
  !cloudinaryConfig.cloudName.startsWith('REPLACE_WITH') &&
  !cloudinaryConfig.uploadPreset.startsWith('REPLACE_WITH');
