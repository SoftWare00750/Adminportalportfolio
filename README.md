# Admin Portal

A responsive React + Firebase admin portal for managing contact form messages.

## Tech Stack

- **React 18** + **Vite** — fast dev server & build
- **Firebase 10** — Authentication & Firestore real-time database
- **Tailwind CSS 3** — utility-first styling
- **lucide-react** — icons
- **date-fns** — date formatting

## Getting Started

### 1. Install dependencies

```bash
npm install
```

### 2. Start development server

```bash
npm run dev
```

Open [http://localhost:5173](http://localhost:5173)

### 3. Build for production

```bash
npm run build
npm run preview   # preview the production build locally
```

## Project Structure

```
admin-portal/
├── index.html                  # HTML entry point (includes Google Fonts)
├── vite.config.js              # Vite configuration
├── tailwind.config.js          # Tailwind CSS configuration
├── postcss.config.js           # PostCSS configuration
├── package.json
└── src/
    ├── main.jsx                # React root (mounts App)
    ├── App.jsx                 # Root component
    ├── AdminPortal.jsx         # Main portal component (all logic + UI)
    └── index.css               # Global styles + Tailwind imports
```

## Firebase Setup

The Firebase config in `AdminPortal.jsx` is pre-configured. To use your own project:

1. Go to [Firebase Console](https://console.firebase.google.com)
2. Create a project → Add a web app
3. Copy the `firebaseConfig` object into `AdminPortal.jsx`
4. Enable **Email/Password** under Authentication → Sign-in method
5. Enable **Firestore Database** → create in production mode

### Firestore message document shape

```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "message": "Hello, I'd like to get in touch...",
  "createdAt": "<Firestore Timestamp>",
  "read": false
}
```

## Features

- 🔐 Firebase email/password authentication
- 📬 Real-time message inbox via Firestore `onSnapshot`
- ✅ Mark as read automatically on open
- 🗑️ Delete messages with confirmation
- 🔍 Live search across name, email, and message body
- 📊 Stats overview (total / unread / read)
- 📱 Fully responsive — dedicated mobile layout with drawer sidebar
- 🎨 Custom dark theme with Sora + DM Mono typography

## Responsive Behaviour

| Breakpoint | Layout |
|---|---|
| Mobile (`< 768px`) | Single-panel: list view ↔ detail view with back button; hamburger opens filter/stats drawer |
| Desktop (`≥ 768px`) | Two-panel: sidebar (left) + detail panel (right) always visible |
