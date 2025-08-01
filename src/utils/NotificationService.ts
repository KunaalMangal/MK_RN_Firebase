import { Platform } from 'react-native';
import notifee, {
  AndroidImportance,
  AndroidCategory,
  AndroidColor,
  AndroidVisibility,
  AndroidAction,
  NotificationAndroid,
  TimestampTrigger,
  TriggerType,
  EventType,
  Event,
} from '@notifee/react-native';

const CHANNEL_ID = 'default';
const SMALL_ICON = 'ic_launcher';

class NotificationService {
  static async createChannel(): Promise<void> {
    if (Platform.OS === 'android') {
      try {
        await notifee.createChannel({
          id: CHANNEL_ID,
          name: 'Default Channel',
          importance: AndroidImportance.HIGH,
          visibility: AndroidVisibility.PUBLIC,
        });
      } catch (error) {
        console.error('Notification channel creation failed:', error);
      }
    }
  }

  static async display(
    title: string,
    body: string,
    withActions = false,
  ): Promise<void> {
    if (!title.trim() || !body.trim()) {return;}
    await this.createChannel();

    const androidActions: AndroidAction[] = withActions
      ? [
          { title: 'Open App', pressAction: { id: 'open-app' } },
          { title: 'Dismiss', pressAction: { id: 'dismiss' } },
        ]
      : [];

    const androidOptions: NotificationAndroid = {
      channelId: CHANNEL_ID,
      smallIcon: SMALL_ICON,
      color: AndroidColor.BLUE,
      category: AndroidCategory.MESSAGE,
      actions: androidActions,
    };

    try {
      await notifee.displayNotification({
        title,
        body,
        android: androidOptions,
        ios: {
          sound: 'default',
          foregroundPresentationOptions: {
            badge: true,
            sound: true,
            alert: true,
          },
        },
      });
    } catch (error) {
      console.error('Failed to display notification:', error);
    }
  }

  static async schedule(
    title: string,
    body: string,
    timestamp: number,
  ): Promise<void> {
    await this.createChannel();

    const trigger: TimestampTrigger = {
      type: TriggerType.TIMESTAMP,
      timestamp,
      alarmManager: true,
    };

    try {
      await notifee.createTriggerNotification(
        {
          title,
          body,
          android: { channelId: CHANNEL_ID, smallIcon: SMALL_ICON },
        },
        trigger,
      );
    } catch (error) {
      console.error('Failed to schedule notification:', error);
    }
  }

  static registerForegroundEvents(): () => void {
    return notifee.onForegroundEvent((event: Event) => {
      const { type, detail } = event;

      switch (type) {
        case EventType.PRESS:
          console.log('Notification pressed:', detail.notification?.title);
          break;
        case EventType.ACTION_PRESS:
          console.log('Action pressed:', detail.pressAction?.id);
          break;
      }
    });
  }

  static registerBackgroundHandler(): void {
    notifee.onBackgroundEvent(async (event: Event) => {
      const { type, detail } = event;
      if (type === EventType.ACTION_PRESS) {
        switch (detail.pressAction?.id) {
          case 'open-app':
            console.log('App will be opened from background');
            break;
          case 'dismiss':
            console.log('Notification dismissed');
            break;
        }
      }
    });
  }

  static async cancelAll(): Promise<void> {
    await notifee.cancelAllNotifications();
  }
}

export default NotificationService;
