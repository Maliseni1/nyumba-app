import React, { useEffect } from 'react';
import { PushNotifications } from '@capacitor/push-notifications';
import { Capacitor } from '@capacitor/core';
import { useAuth } from '../context/AuthContext';
import { registerDevice } from '../services/api';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';

const PushNotificationListener = () => {
    const { authUser } = useAuth();
    const navigate = useNavigate();

    useEffect(() => {
        // 1. Only run on native devices (Android/iOS) and when user is logged in
        if (!Capacitor.isNativePlatform() || !authUser) {
            return;
        }

        const registerNotifications = async () => {
            let permStatus = await PushNotifications.checkPermissions();

            if (permStatus.receive === 'prompt') {
                permStatus = await PushNotifications.requestPermissions();
            }

            if (permStatus.receive !== 'granted') {
                // console.log('User denied permissions!');
                return;
            }

            // Register with Apple / Google to get the token
            await PushNotifications.register();
        };

        registerNotifications();

        // --- LISTENERS ---

        // 2. On Success: We got the token! Send it to our backend.
        const registrationListener = PushNotifications.addListener('registration', 
            async (token) => {
                try {
                    console.log('Push Registration success, token: ' + token.value);
                    await registerDevice(token.value);
                } catch (error) {
                    console.error('Failed to send token to backend', error);
                }
            }
        );

        // 3. On Error
        const errorListener = PushNotifications.addListener('registrationError', 
            (error) => {
                console.error('Error on registration: ' + JSON.stringify(error));
            }
        );

        // 4. On Notification Received (Foreground)
        // Show a toast so the user sees the message immediately
        const receivedListener = PushNotifications.addListener('pushNotificationReceived', 
            (notification) => {
                toast.info(notification.title + ': ' + notification.body);
            }
        );

        // 5. On Notification Tapped (Background -> Foreground)
        // Navigate to the specific conversation
        const actionListener = PushNotifications.addListener('pushNotificationActionPerformed', 
            (notification) => {
                const data = notification.notification.data;
                if (data && data.conversationId) {
                    navigate('/messages', { state: { conversationId: data.conversationId } });
                }
            }
        );

        // Cleanup listeners on unmount
        return () => {
            registrationListener.remove();
            errorListener.remove();
            receivedListener.remove();
            actionListener.remove();
        };

    }, [authUser, navigate]); // Re-run if user logs in/out

    return null; // This component doesn't render anything visible
};

export default PushNotificationListener;