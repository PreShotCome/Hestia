# Hestia

A private apartment inventory app for you and your partner. Catalog your
belongings by **room → container → item**, attach photos, tag things, and
search instantly so you can always find what you own.

Built with Expo (React Native) and Firebase. Android-focused, not published to
any store — you install it on your own phones.

## How it works

- **Rooms** hold **containers** (drawers, bins, shelves, closets…) and items.
- **Items** live in a container, or loosely in a room. Each item has a name,
  quantity, photo, notes, and any number of **tags**.
- **Search** filters every item by name, notes, or tag, and can filter/sort by
  tag.
- You and your partner each have a login but share one **household**, so all
  data syncs live between both phones.

## One-time setup

### 1. Create a Firebase project

1. Go to <https://console.firebase.google.com> and create a project.
2. In **Build → Authentication**, enable the **Email/Password** sign-in method.
3. In **Build → Firestore Database**, create a database (production mode).
4. In **Build → Storage**, enable Storage.
5. In **Project settings → General → Your apps**, add a **Web app** and copy the
   `firebaseConfig` values shown.

### 2. Add your config to the app

Open `lib/firebaseConfig.ts` and replace the placeholder values with the ones
from your Firebase web app. (These values are not secret — access is controlled
by the security rules below.)

### 3. Deploy the security rules

The repo includes `firestore.rules` and `storage.rules`. Deploy them so only
household members can read/write your data. Either:

- Paste their contents into the **Rules** tabs of Firestore and Storage in the
  Firebase console, **or**
- Use the Firebase CLI: `npm i -g firebase-tools`, then `firebase login` and
  `firebase deploy --only firestore:rules,storage`.

## Running the app

```bash
npm install
npx expo start
```

Install **Expo Go** from the Play Store on your Android phone and scan the QR
code shown in the terminal.

### First launch

1. Sign up with an email and password.
2. **Create a household** and give it a name. Open the **Settings** screen
   (gear icon, top right) to find your **invite code**.
3. Your partner installs the app, signs up with their own account, chooses
   **Join**, and enters that invite code. You now share one inventory.

## Building an installable APK

Expo Go is fine for everyday use, but for a permanent install:

```bash
npm i -g eas-cli
eas login
eas build -p android --profile preview
```

This produces an `.apk` you can download and sideload onto both phones.

## Project layout

```
app/            screens (expo-router file-based routing)
  (auth)/       login, signup, household setup
  (tabs)/       Search, Rooms, Add Item
  room/         room detail
  container/    container detail + add
  item/         item detail + add
lib/            firebase setup, auth, data layer, types, helpers
components/     reusable UI (forms, cards, photo picker, tags)
firestore.rules / storage.rules   security rules
```
