import {PermissionsAndroid, Platform} from 'react-native';
import messaging from '@react-native-firebase/messaging';

class FirebaseNotification {
  // initialize function
  async init() {
    await this.checkPermission();
    this.setupMessageListeners();
  }

  //   checking the firebase permission is given or not
  async checkPermission() {
    try {
      const authStatus = await messaging().hasPermission();
      const enabled =
        authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
        authStatus === messaging.AuthorizationStatus.PROVISIONAL;
      console.log('check notification permission', enabled);
      if (enabled) {
        await this.getFCMToken();
      } else {
        await this.requestPermission();
      }
    } catch (error) {
      console.error('error during checking notification permission', error);
    }
  }

  //   requesting the firebase push notification permission
  async requestPermission() {
    try {
      if (Platform.OS === 'android') {
        await this.requestAndroidPermission();
      } else if (Platform.OS === 'ios') {
        await this.requestIOSPermission();
      }
    } catch (error) {
      console.error('error during requesting notification permission', error);
    }
  }

  //   requesting the firebase push notification permission for Android
  async requestAndroidPermission() {
    console.log('requestAndroidPermission', Platform.Version);
    if (Platform.Version >= '33') {
      const result = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS,
      );
      console.log('Android notification permission', result);
      if (result === PermissionsAndroid.RESULTS.GRANTED) {
        await this.getFCMToken();
      } else {
        console.log('Notification permission denied on Android');
      }
    } else {
      await this.getFCMToken();
    }
  }

  //   requesting the firebase push notification permission for IOS
  async requestIOSPermission() {
    console.log('requestIOSPermission');
    const authStatus = await messaging().requestPermission();
    const enabled =
      authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
      authStatus === messaging.AuthorizationStatus.PROVISIONAL;

    console.log('Authorization status:', authStatus);

    if (enabled) {
      await this.getFCMToken();
    } else {
      console.log('Notification permission denied on iOS');
    }
  }

  //   generating the fcm token if not exists
  async getFCMToken() {
    try {
      const fcmToken = '';
      if (fcmToken) {
        console.log('FCM Token already exists...', fcmToken);
      } else {
        const token = await messaging().getToken();
        console.log('FCM Token generate...', token);
        //   manage the fcm token further after receive
      }
    } catch (error) {
      console.error('Error generating FCM token', error);
    }
  }

  //  listners for receiving the remote messages
  setupMessageListeners() {
    // call when the notification arrive in foreground
    messaging().onMessage(async remoteMessage => {
      console.log('FCM Message Data:', remoteMessage);
    });

    // call when the app in quit/kiiled state and tap on notification from notification tray
    messaging()
      .getInitialNotification()
      .then(async remoteMessage => {
        console.log('FCM getInitialNotification Message:', remoteMessage);
      })
      .catch(error => {
        console.error('error during generating notification token', error);
      });

    // call when the app in background and tap on notification from notification tray
    messaging().onNotificationOpenedApp(async remoteMessage => {
      console.log('FCM Notification Opened:', remoteMessage);
    });

    // refreshing FCM token
    messaging().onTokenRefresh(token => {
      console.log('FCM Token Refreshed:', token);
    });
  }
}

export default FirebaseNotification;
