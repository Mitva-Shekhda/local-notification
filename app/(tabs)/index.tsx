import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet } from 'react-native';
import * as Notifications from 'expo-notifications';
import DropDownPicker from 'react-native-dropdown-picker';
import { cancelAllNotifications, scheduleNotification } from '../utils/notificationService';

function setupForegroundNotificationListener() {
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
        snoozeTime
      );
    }
  });
}

export default function NotificationScreen() {
  const [notifications, setNotifications] = useState<Notifications.NotificationRequest[]>([]);
  const [repeat, setRepeat] = useState('once');
  const [open, setOpen] = useState(false);
  const [items, setItems] = useState([
    { label: 'Once', value: 'once' },
    { label: 'Daily', value: 'daily' },
    { label: 'Weekly', value: 'weekly' },
  ]);

  useEffect(() => {
    setupForegroundNotificationListener();

    async function fetchNotifications() {
      const scheduled = await Notifications.getAllScheduledNotificationsAsync();
      setNotifications(scheduled);
    }

    fetchNotifications();
  }, []);

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Schedule Notification</Text>

      <DropDownPicker
        open={open}
        value={repeat}
        items={items}
        setOpen={setOpen}
        setValue={setRepeat}
        setItems={setItems}
        containerStyle={styles.dropdown}
        style={styles.dropdownPicker}
      />

      <TouchableOpacity
        style={styles.button}
        onPress={async () => {
          const triggerDate = new Date();
          triggerDate.setMinutes(triggerDate.getMinutes() + 1);

          await scheduleNotification('Reminder', 'This is your notification!', triggerDate);
          const updatedNotifications = await Notifications.getAllScheduledNotificationsAsync();
          setNotifications(updatedNotifications);
        }}
      >
        <Text style={styles.buttonText}>Schedule Notification</Text>
      </TouchableOpacity>

      <Text style={styles.subHeader}>Scheduled Notifications</Text>
      {notifications.length === 0 ? (
        <Text style={styles.noNotificationText}>No notifications scheduled</Text>
      ) : (
        <FlatList
          data={notifications}
          keyExtractor={(item) => item.identifier}
          renderItem={({ item }: { item: Notifications.NotificationRequest }) => (
            <View style={styles.notificationCard}>
              <Text style={styles.notificationTitle}>{item.content.title}</Text>
              <Text style={styles.notificationBody}>{item.content.body}</Text>
            </View>
          )}
        />
      )}

      <TouchableOpacity style={styles.cancelButton} onPress={async () => {
        await cancelAllNotifications();
        const updatedNotifications = await Notifications.getAllScheduledNotificationsAsync();
        setNotifications(updatedNotifications);
      }}>
        <Text style={styles.cancelButtonText}> Cancel All Notifications</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#f8f9fa',
    justifyContent: 'center',
  },
  header: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 15,
    textAlign: 'center',
  },
  subHeader: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#555',
    marginTop: 20,
  },
  dropdown: {
    marginBottom: 10,
  },
  dropdownPicker: {
    backgroundColor: '#fff',
    borderColor: '#ddd',
  },
  button: {
    backgroundColor: '#007bff',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 10,
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  notificationCard: {
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 8,
    marginTop: 10,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  notificationTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  notificationBody: {
    fontSize: 14,
    color: '#666',
    marginTop: 5,
  },
  noNotificationText: {
    textAlign: 'center',
    color: '#999',
    marginTop: 10,
  },
  cancelButton: {
    backgroundColor: '#dc3545',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 20,
  },
  cancelButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
});



