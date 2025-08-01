// firebase.ts
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getMessaging, getToken, onMessage } from "firebase/messaging";
import axios from 'axios';
import { apiBaseUrl } from "./lib/utils";

// Your web app's Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyDmfyHHxvOeoy0pi3hNPD4N61EFCFQHCpk",
    authDomain: "gazacoding-8d421.firebaseapp.com",
    projectId: "gazacoding-8d421",
    storageBucket: "gazacoding-8d421.firebasestorage.app",
    messagingSenderId: "67710457100",
    appId: "1:67710457100:web:dd88db9a25dcdcd8d6e529",
    measurementId: "G-YV7LL7LMDL"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const messaging = getMessaging(app);

export { messaging, getToken, onMessage };

// Cache لتجنب إرسال الطلب مرات متعددة
let deviceTokenRegistered = false;
let deviceTokenRegistrationPromise: Promise<void> | null = null;

// Function to register device token after authentication
export const registerDeviceToken = async () => {
    // إذا تم التسجيل بالفعل، لا تفعل شيئاً
    if (deviceTokenRegistered) {
        console.log('Device token already registered');
        return;
    }

    // إذا كان هناك عملية تسجيل جارية، انتظرها
    if (deviceTokenRegistrationPromise) {
        console.log('Device token registration in progress, waiting...');
        return deviceTokenRegistrationPromise;
    }

    // بدء عملية التسجيل
    deviceTokenRegistrationPromise = (async () => {
        try {
            const currentToken = await getToken(messaging, { 
                vapidKey: 'BCNx8QUEkYqJgAqYOA-IHPhfWLKfpe6s4Nz5EHmFUPu9EQ7iS70wV68ipFAkmjUTZmaAEdyE3B0whxZIAcAyjOQ' 
            });
            
            if (currentToken) {
                // Try both new sessionStorage and old localStorage for backward compatibility
                let userToken = sessionStorage.getItem('auth_token');
                if (userToken) {
                    // Decrypt if it's encrypted
                    try {
                        const decoded = atob(userToken);
                        userToken = decoded.replace('gaza-coding-space-salt', '');
                    } catch (e) {
                        // If decryption fails, use as is
                    }
                } else {
                    // Fallback to localStorage
                    userToken = localStorage.getItem('token');
                }
                
                if (userToken) {
                    await axios.post(`${apiBaseUrl}/api/device-tokens`, {
                        token: currentToken,
                        device_name: window.navigator.userAgent
                    }, {
                        headers: { Authorization: `Bearer ${userToken}` }
                    });
                    console.log('Device token registered successfully');
                    deviceTokenRegistered = true; // علامة أن التسجيل تم بنجاح
                } else {
                    console.log('No user token available for device registration');
                }
            } else {
                console.log('No Firebase token available');
            }
        } catch (error) {
            console.error('Error registering device token:', error);
            // في حالة الخطأ، نعيد تعيين العلامة للسماح بالمحاولة مرة أخرى
            deviceTokenRegistered = false;
        } finally {
            // إعادة تعيين الـ promise
            deviceTokenRegistrationPromise = null;
        }
    })();

    return deviceTokenRegistrationPromise;
};

// Function to reset device token registration (useful for logout)
export const resetDeviceTokenRegistration = () => {
    deviceTokenRegistered = false;
    deviceTokenRegistrationPromise = null;
    console.log('Device token registration reset');
};

// Initialize device token registration if user is already authenticated
export const initializeFirebaseForAuthenticatedUser = () => {
    const userToken = sessionStorage.getItem('auth_token') || localStorage.getItem('token');
    if (userToken && !deviceTokenRegistered) {
        registerDeviceToken();
    }
};

// Handle foreground messages
onMessage(messaging, (payload) => {
    console.log('Message received:', payload);
    alert(payload.notification?.body || 'New message received!');
});