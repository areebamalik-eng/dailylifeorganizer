import React from 'react';
import { View, Text, Button, StyleSheet, Platform } from 'react-native';
import notifee from '@notifee/react-native';
import { useNavigation } from '@react-navigation/native';

const StopRingtoneScreen = () => {
  const navigation = useNavigation();

  const stopSound = async () => {
    try {
      if (Platform.OS === 'android') {
        await notifee.stopForegroundService();
      }

      
      navigation.goBack();
    } catch (error) {
      console.log('❌ Error stopping sound:', error);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.text}>🔔 Reminder is active</Text>
      <Button title="Stop Reminder" onPress={stopSound} color="#d9534f" />
    </View>
  );
};

export default StopRingtoneScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
    backgroundColor: '#fff0f0',
  },
  text: {
    fontSize: 20,
    marginBottom: 20,
    color: '#333',
  },
});
