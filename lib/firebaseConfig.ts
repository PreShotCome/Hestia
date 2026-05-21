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
  apiKey: 'AIzaSyB2Sdlt9a-E3X0fXC-pakSJd0NTrX6c3ww',
  authDomain: 'hestia-39396.firebaseapp.com',
  projectId: 'hestia-39396',
  storageBucket: 'hestia-39396.firebasestorage.app',
  messagingSenderId: '818540659337',
  appId: '1:818540659337:web:9419216c317e10ba0ebc58',
};

export const isFirebaseConfigured =
  !firebaseConfig.apiKey.startsWith('REPLACE_WITH');
