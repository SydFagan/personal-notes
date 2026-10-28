# Personal Notes

A personal notes app built with **React Native**, **Expo**, **Firebase Authentication**, and **Cloud Firestore**. Each user signs in with email and password and can only see and change their own notes.

## Features

- Sign up, log in, and log out with email and password (session persists between launches)
- Create, edit, and delete notes in a modal
- Notes sync live with Cloud Firestore
- Each note has a title, content, and creation date, and is tied to its owner's user ID
- Mark notes as favorites and filter between **All notes** and **Favorites**
- Note count and favorite count in the header
- Notes listed in a `FlatList` with a title and two-line preview
- Empty states, confirmation prompts for delete and logout, and friendly error messages

## Tech stack

React Native · Expo · Firebase Auth · Cloud Firestore · `@expo/vector-icons`

## Data model

Collection: `notes`

| Field       | Type      | Description                       |
|-------------|-----------|-----------------------------------|
| `title`     | string    | Note title                        |
| `content`   | string    | Note body                         |
| `favorite`  | boolean   | Whether the note is a favorite    |
| `userId`    | string    | UID of the owner                  |
| `createdAt` | timestamp | Server timestamp when created     |

Security rules (`firestore.rules`) only allow a signed-in user to read, update, or delete notes where `userId` matches their UID, and to create notes tagged with their own UID.

## Setup

1. Install dependencies:
   ```bash
   npm install
   ```
2. Create a Firebase project at https://console.firebase.google.com and:
   - Add a **Web app** and copy its config values.
   - Enable **Authentication → Sign-in method → Email/Password**.
   - Create a **Firestore Database**, then paste the contents of `firestore.rules` into the **Rules** tab and publish.
3. Copy `.env.example` to `.env` and fill in your Firebase values:
   ```bash
   cp .env.example .env
   ```
4. Start the app:
   ```bash
   npx expo start
   ```
   Scan the QR code with Expo Go, or press `i` / `a` for a simulator.

> `.env` is listed in `.gitignore`. Never commit your credentials.

## Project structure

```
App.js                      Chooses auth or notes screen
firebaseConfig.js           Firebase initialization (reads .env)
firestore.rules             Security rules
src/context/AuthContext.js  Auth state and actions
src/screens/AuthScreen.js   Login and sign-up
src/screens/NotesScreen.js  Notes list, filter, favorites, CRUD
src/components/NoteModal.js Add/edit modal
src/theme.js                Shared colors
```
## Proof App Works
<img width="370" height="750" alt="Screenshot 2026-10-28 133543" src="https://github.com/user-attachments/assets/11de0366-89c3-43b9-adae-c0975d49a8dd" />
<img width="370" height="750" alt="Screenshot 2026-10-28 133154" src="https://github.com/user-attachments/assets/64630935-a94d-4c0d-a6c2-e4a8a9c9a4af" />

