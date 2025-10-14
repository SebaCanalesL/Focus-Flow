import { useEffect, useState } from 'react';
import { getMessaging, getToken, onMessage } from 'firebase/messaging';
import { app } from '@/lib/firebase';

export const useFCM = () => {
  const [token, setToken] = useState<string | null>(null);
  const [isSupported, setIsSupported] = useState(false);

  useEffect(() => {
    // Check if FCM is supported
    if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
      setIsSupported(true);
      
      const messaging = getMessaging(app);
      
      // Request permission and get token
      const requestPermission = async () => {
        try {
          const permission = await Notification.requestPermission();
          if (permission === 'granted') {
            const currentToken = await getToken(messaging, {
              vapidKey: process.env.NEXT_PUBLIC_FIREBASE_VAPID_KEY,
            });
            
            if (currentToken) {
              setToken(currentToken);
              console.log('FCM Token:', currentToken);
              
              // Send token to server for storage
              // You can implement this API call
              // await sendTokenToServer(currentToken);
            } else {
              console.log('No registration token available.');
            }
          } else {
            console.log('Notification permission denied.');
          }
        } catch (error) {
          console.error('An error occurred while retrieving token:', error);
        }
      };

      // Handle foreground messages
      const unsubscribe = onMessage(messaging, (payload) => {
        console.log('Message received in foreground:', payload);
        
        // Show notification manually in foreground
        if (payload.notification) {
          new Notification(payload.notification.title || 'FocusFlow', {
            body: payload.notification.body,
            icon: '/logo.png',
            tag: 'focusflow-notification',
          });
        }
      });

      requestPermission();

      return () => {
        unsubscribe();
      };
    }
  }, []);

  return {
    token,
    isSupported,
  };
};
