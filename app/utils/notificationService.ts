import * as Notifications from 'expo-notifications';

export async function requestNotificationPermissions() {
  const { status } = await Notifications.requestPermissionsAsync();
  if (status !== 'granted') {
    alert('You need to enable notifications to receive alerts.');
    return false;
  }
  return true;
}

const getRepeatInterval = (repeat: 'once' | 'daily' | 'weekly') => {
  switch (repeat) {
    case 'daily':
      return { seconds: 86400, repeats: true }; 
    case 'weekly':
      return { seconds: 604800, repeats: true }; 
    default:
      return null;
  }
};

export async function scheduleNotification(
  title: string,
  body: string,
  date: Date,
  repeat: 'once' | 'daily' | 'weekly' = 'once',
) {
  const hasPermission = await requestNotificationPermissions();
  if (!hasPermission) return;

  let trigger: any = { date };

  const repeatInterval = getRepeatInterval(repeat);
  if (repeatInterval) {
    trigger = repeatInterval;
  }

  await Notifications.scheduleNotificationAsync({
    content: { title, body, sound: true },
    trigger,
  });
}

export async function cancelAllNotifications() {
  await Notifications.cancelAllScheduledNotificationsAsync();
}

export function setupForegroundNotificationListener() {
  Notifications.addNotificationReceivedListener(notification => {
    console.log('Foreground Notification Received:', notification);
  });

  Notifications.addNotificationResponseReceivedListener(async response => {
    const { actionIdentifier, notification } = response;
    console.log('Notification Action:', actionIdentifier);

    if (actionIdentifier === 'snooze') {
      console.log('Snooze action clicked');
      const snoozeTime = new Date();
      snoozeTime.setMinutes(snoozeTime.getMinutes() + 10);

      await scheduleNotification(
        notification.request.content.title || 'Reminder',
        notification.request.content.body || '',
        snoozeTime,
        'once'
      );
    }
  });
}

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});
