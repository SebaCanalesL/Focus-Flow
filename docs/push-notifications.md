# Push Notifications Setup

## Overview
FocusFlow uses Firebase Cloud Messaging (FCM) for push notifications to remind users about their habits.

## Current Implementation

### 1. Web Notifications (Browser)
- Uses the browser's native Notification API
- Checks for reminders every minute
- Shows notifications for habits that haven't been completed today
- Works with both old (`reminderEnabled`, `reminderTime`) and new (`reminders` array) systems

### 2. Firebase Cloud Messaging (FCM)
- Service worker: `public/firebase-messaging-sw.js`
- Hook: `src/hooks/use-fcm.ts`
- Automatically requests permission and gets FCM token
- Saves token to user profile in Firestore
- Handles foreground and background messages

## Configuration Required

### Environment Variables
Add these to your `.env.local`:

```env
# Firebase VAPID Key for Push Notifications
NEXT_PUBLIC_FIREBASE_VAPID_KEY=your_vapid_key_here

# Firebase Configuration (should already exist)
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key_here
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=123456789012
NEXT_PUBLIC_FIREBASE_APP_ID=1:123456789012:web:abcdef1234567890abcdef
```

### Firebase Console Setup
1. Go to Firebase Console > Project Settings > Cloud Messaging
2. Generate a VAPID key pair
3. Add the VAPID key to your environment variables
4. Update the service worker with your actual Firebase config

## How It Works

### Reminder System
1. **New System**: Uses `reminders` array with multiple reminders per habit
2. **Old System**: Falls back to `reminderEnabled` and `reminderTime` for backward compatibility
3. **Day Mapping**: Maps JavaScript Date.getDay() to our reminder format (L, M, X, J, V, S, D)

### Notification Flow
1. User grants notification permission
2. FCM token is generated and saved to user profile
3. Every minute, the app checks for due reminders
4. If a habit hasn't been completed today and has a reminder for the current time/day, a notification is shown
5. Notifications work both in foreground (via FCM) and background (via service worker)

## Testing

### Local Testing
1. Make sure you're using HTTPS (required for notifications)
2. Check browser console for FCM token
3. Verify token is saved in Firestore user document
4. Test notifications by setting a reminder for the current time

### Production Testing
1. Deploy with proper Firebase configuration
2. Test on different devices and browsers
3. Verify notifications work when app is in background

## Troubleshooting

### Common Issues
1. **No notifications**: Check if permission was granted
2. **Token not generated**: Verify Firebase configuration
3. **Notifications not showing**: Check if service worker is registered
4. **Wrong timing**: Verify day mapping and time format

### Debug Steps
1. Check browser console for errors
2. Verify FCM token in Firestore
3. Test with browser dev tools > Application > Service Workers
4. Check Firebase Console > Cloud Messaging for delivery status
