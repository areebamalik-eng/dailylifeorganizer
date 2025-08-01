import notifee, {
  AndroidImportance,
  AndroidCategory,
  TimestampTrigger,
  TriggerType,
} from '@notifee/react-native';
import { Platform } from 'react-native';

export async function createNotificationChannel() {
  if (Platform.OS === 'android') {
    await notifee.createChannel({
      id: 'task-reminders',
      name: 'Task Reminders',
      importance: AndroidImportance.HIGH,
      sound: 'reminder', 
      vibration: true,
    });
  }
}


export async function scheduleTaskNotification(title: string, body: string, date: Date) {
  await createNotificationChannel();

  const trigger: TimestampTrigger = {
    type: TriggerType.TIMESTAMP,
    timestamp: date.getTime(), 
    alarmManager: true, 
  };

  await notifee.createTriggerNotification(
    {
      title,
      body,
      android: {
        channelId: 'task-reminders',
        pressAction: {
          id: 'default',
        },
        sound: 'reminder',
        category: AndroidCategory.ALARM, 
        autoCancel: false, 
        ongoing: true,     
        fullScreenAction: {
          id: 'default',   
        },
      },
    },
    trigger
  );
}
