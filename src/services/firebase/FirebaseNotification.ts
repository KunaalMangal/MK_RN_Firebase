import {Platform, PermissionsAndroid} from 'react-native';
import messaging, {
  AuthorizationStatus,
  FirebaseMessagingTypes,
} from '@react-native-firebase/messaging';

import {NotificationService} from '../../utils';

class FirebaseNotification {
  async init(): Promise<void> {
    await this.checkPermission();
    this.setupMessageListeners();
  }

  private async checkPermission(): Promise<void> {
    try {
      const authStatus = await messaging().hasPermission();
      const enabled =
        authStatus === AuthorizationStatus.AUTHORIZED ||
        authStatus === AuthorizationStatus.PROVISIONAL;

      console.log('[Notification Permission Enabled]:', enabled);
      if (enabled) {
        await this.getFCMToken();
      } else {
        await this.requestPermission();
      }
    } catch (error) {
      console.error('[checkPermission error]:', error);
    }
  }

  private async requestPermission(): Promise<void> {
    try {
      if (Platform.OS === 'android') {
        await this.requestAndroidPermission();
      } else if (Platform.OS === 'ios') {
        await this.requestIOSPermission();
      }
    } catch (error) {
      console.error('[requestPermission error]:', error);
    }
  }

  private async requestAndroidPermission(): Promise<void> {
    try {
      const sdkVersion = Platform.Version as number;
      if (sdkVersion >= 33) {
        const result = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS,
        );

        if (result === PermissionsAndroid.RESULTS.GRANTED) {
          await this.getFCMToken();
        } else {
          console.warn('[Android Notification Permission Denied]');
        }
      } else {
        await this.getFCMToken();
      }
    } catch (error) {
      console.error('[requestAndroidPermission error]:', error);
    }
  }

  private async requestIOSPermission(): Promise<void> {
    try {
      const authStatus = await messaging().requestPermission();
      const enabled =
        authStatus === AuthorizationStatus.AUTHORIZED ||
        authStatus === AuthorizationStatus.PROVISIONAL;

      console.log('[iOS Authorization Status]:', authStatus);

      if (enabled) {
        await this.getFCMToken();
      } else {
        console.warn('[iOS Notification Permission Denied]');
      }
    } catch (error) {
      console.error('[requestIOSPermission error]:', error);
    }
  }

  private async getFCMToken(): Promise<void> {
    try {
      // const existingToken = 'appStorage.getItem(STORAGE_KEYS.DEVICE_TOKEN)';
      const existingToken = '';

      if (existingToken) {
        console.log('[FCM Token Exists]:', existingToken);
        return;
      }

      const newToken = await messaging().getToken();

      if (newToken) {
        console.log('[FCM Token Fetched]:', newToken);
        // appStorage.setItem(STORAGE_KEYS.DEVICE_TOKEN, newToken);
      }
    } catch (error) {
      console.error('[getFCMToken error]:', error);
    }
  }

  private setupMessageListeners(): void {
    messaging().onMessage(
      async (remoteMessage: FirebaseMessagingTypes.RemoteMessage) => {
        console.log('[Foreground FCM Message]:', remoteMessage);
        const title = remoteMessage.notification?.title ?? 'New Notification';
        const body =
          remoteMessage.notification?.body ?? 'You have a new message.';
        await NotificationService.display(title, body);
      },
    );

    messaging()
      .getInitialNotification()
      .then(remoteMessage => {
        if (remoteMessage) {
          console.log('[Initial Notification]:', remoteMessage);
        }
      })
      .catch(error => {
        console.error('[getInitialNotification error]:', error);
      });

    messaging().onNotificationOpenedApp(
      (remoteMessage: FirebaseMessagingTypes.RemoteMessage) => {
        console.log('[Notification Opened in Background]:', remoteMessage);
      },
    );

    messaging().onTokenRefresh((token: string) => {
      console.log('[FCM Token Refreshed]:', token);
      // appStorage.setItem(STORAGE_KEYS.DEVICE_TOKEN, token);
    });
  }

  public registerFirebaseBackgroundHandler(): void {
    messaging().setBackgroundMessageHandler(
      async (remoteMessage: FirebaseMessagingTypes.RemoteMessage) => {
        console.log('[Background FCM Message]:', remoteMessage);
        const title = remoteMessage.notification?.title ?? 'New Notification';
        const body =
          remoteMessage.notification?.body ?? 'You have a new message.';
        await NotificationService.display(title, body);
      },
    );
  }
}

export default new FirebaseNotification();
