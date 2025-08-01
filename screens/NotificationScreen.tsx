import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  ActivityIndicator,
  Alert,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const NotificationsScreen = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchNotifications = async () => {
    try {
      const token = await AsyncStorage.getItem('token');
      if (!token) {
        Alert.alert('Error', 'User not authenticated');
        return;
      }

      const response = await fetch('http://192.168.1.109:8000/api/notifications', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch notifications');
      }

      const data = await response.json();
      setNotifications(data);
    } catch (error: any) {
      Alert.alert('Error', error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  const renderItem = ({ item }: any) => (
    <View style={styles.notification}>
      <Text style={styles.message}>{item.message}</Text>
      <Text style={styles.date}>{new Date(item.created_at).toLocaleString()}</Text>
    </View>
  );

  if (loading) {
    return <ActivityIndicator style={{ marginTop: 20 }} size="large" color="#007bff" />;
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>🔔 Notifications</Text>
      {notifications.length === 0 ? (
        <Text style={{ textAlign: 'center', color: '#888' }}>No notifications</Text>
      ) : (
        <FlatList
          data={notifications}
          keyExtractor={(item) => item.id.toString()}
          renderItem={renderItem}
        />
      )}
    </View>
  );
};

export default NotificationsScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 16,
    textAlign: 'center',
  },
  notification: {
    padding: 14,
    backgroundColor: '#f1f1f1',
    borderRadius: 8,
    marginBottom: 10,
  },
  message: {
    fontSize: 16,
    color: '#333',
  },
  date: {
    fontSize: 12,
    color: '#666',
    marginTop: 6,
    textAlign: 'right',
  },
});
