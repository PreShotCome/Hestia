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
  apiKey: 'AIzaSyAnZ3sLf8k7XERUawLtuN9al6qviaBGfTU',
  authDomain: 'hestia-fbc49.firebaseapp.com',
  projectId: 'hestia-fbc49',
  storageBucket: 'hestia-fbc49.firebasestorage.app',
  messagingSenderId: '683887454101',
  appId: '1:683887454101:web:c894335b6b2cf155b6789c',
};

export const isFirebaseConfigured =
  !firebaseConfig.apiKey.startsWith('REPLACE_WITH');
