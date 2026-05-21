// ---------------------------------------------------------------------------
// Firebase project configuration.
//
// Replace the placeholder values below with your own Firebase web app config:
//   Firebase Console -> Project settings -> "Your apps" -> Web app -> SDK setup.
//
// These values are NOT secret. They identify the project; actual access is
// enforced by firestore.rules and storage.rules. It is safe to commit them.
// ---------------------------------------------------------------------------

export const firebaseConfig = {
  apiKey: 'REPLACE_WITH_YOUR_API_KEY',
  authDomain: 'REPLACE_WITH_YOUR_PROJECT.firebaseapp.com',
  projectId: 'REPLACE_WITH_YOUR_PROJECT_ID',
  storageBucket: 'REPLACE_WITH_YOUR_PROJECT.appspot.com',
  messagingSenderId: 'REPLACE_WITH_YOUR_SENDER_ID',
  appId: 'REPLACE_WITH_YOUR_APP_ID',
};

export const isFirebaseConfigured =
  !firebaseConfig.apiKey.startsWith('REPLACE_WITH');
