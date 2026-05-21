# Hestia

A private apartment inventory app for you and your partner. Catalog your
belongings by **room → container → item**, attach photos, tag things, and
search instantly so you can always find what you own.

Built with Expo (React Native), Firebase (auth + database), and Cloudinary
(photo hosting). Android-focused, not published to any store — you install it
on your own phones.

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
3. In **Build → Firestore Database**, click **Create database** (production
   mode). This is **Cloud Firestore** — *not* the Realtime Database.
4. In **Project settings → General → Your apps**, add a **Web app** and copy the
   `firebaseConfig` values shown.

The app does not use Firebase Storage (it now requires a billing account);
photos go to Cloudinary instead — see step 4 below.

### 2. Add your Firebase config to the app

Open `lib/firebaseConfig.ts` and replace the placeholder values with the ones
from your Firebase web app. (These values are not secret — access is controlled
by the security rules below.)

### 3. Deploy the Firestore security rules

The repo includes `firestore.rules` so only household members can read/write
your data. Open **Firestore Database → Rules** in the Firebase console, paste
the file's contents, and click **Publish**. (Or, with the Firebase CLI:
`firebase deploy --only firestore:rules`.)

### 4. Set up Cloudinary for photos

Photos are hosted on Cloudinary's free tier (no billing required).

1. Create a free account at <https://cloudinary.com>.
2. On the dashboard, copy your **Cloud name**.
3. Create an **unsigned** upload preset: **Settings (gear) → Upload → Upload
   presets → Add upload preset**, set **Signing Mode** to **Unsigned**, save,
   and copy the preset name.
4. Open `lib/cloudinaryConfig.ts` and paste in your cloud name and preset name.

Photos are optional — the app works without this, you just can't attach
pictures until it's configured.

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
lib/            firebase + cloudinary setup, auth, data layer, types, helpers
components/     reusable UI (forms, cards, photo picker, tags)
firestore.rules   Firestore security rules
```
