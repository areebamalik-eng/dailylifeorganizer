import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  Alert,
  StyleSheet,
  Platform,
  TouchableOpacity,
  ScrollView,
  Switch,
} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation } from '@react-navigation/native';
import { scheduleTaskNotification } from '../src/utils/notificationHelper';
import messaging from '@react-native-firebase/messaging';

const AddTaskScreen = () => {
  const [name, setName] = useState('');
  const [dueDate, setDueDate] = useState(new Date());
  const [dueTime, setDueTime] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [isShared, setIsShared] = useState(false);

  const navigation = useNavigation();

  const handleAddTask = async () => {
    try {
      const token = await AsyncStorage.getItem('token');
      if (!token) {
        Alert.alert('Error', 'User is not authenticated');
        return;
      }

      const formattedDate = dueDate.toISOString().split('T')[0];
      const formattedTime = dueTime.toTimeString().split(' ')[0];

      const payload = {
        name,
        due_date: formattedDate,
        due_time: formattedTime,
        is_shared: isShared,
      };

      const response = await fetch('http://192.168.1.109:8000/api/tasks', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to add task');
      }

      const savedTask = await response.json();

    
      const notificationDateTime = new Date(dueDate);
      notificationDateTime.setHours(dueTime.getHours());
      notificationDateTime.setMinutes(dueTime.getMinutes());

      scheduleTaskNotification(
        'Task Reminder ⏰',
        `Don't forget: ${name}`,
        notificationDateTime
      );
      if (isShared) {
        await fetch('http://192.168.1.109:8000/api/send-task-notification', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            title: '📌 New Shared Task',
            message: `${name} - due at ${formattedTime} on ${formattedDate}`,
          }),
        });
      }

      Alert.alert('Success', '✅ Task added and notifications sent');
      setName('');
      setDueDate(new Date());
      setDueTime(new Date());
      setIsShared(false);
      navigation.navigate('TaskList');
    } catch (error: any) {
      console.error('❌ Error:', error);
      Alert.alert('Error', error.message || '❌ Failed to add task');
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>📝 Add New Task</Text>

      <Text style={styles.label}>Task Name:</Text>
      <TextInput
        value={name}
        onChangeText={setName}
        style={styles.input}
        placeholder="Enter task name"
        placeholderTextColor="#aaa"
      />

      <Text style={styles.label}>Due Date:</Text>
      <TouchableOpacity onPress={() => setShowDatePicker(true)} style={styles.dateButton}>
        <Text style={styles.dateText}>{dueDate.toDateString()}</Text>
      </TouchableOpacity>

      <Text style={styles.label}>Due Time:</Text>
      <TouchableOpacity onPress={() => setShowTimePicker(true)} style={styles.dateButton}>
        <Text style={styles.dateText}>
          {dueTime.getHours().toString().padStart(2, '0')}:
          {dueTime.getMinutes().toString().padStart(2, '0')}
        </Text>
      </TouchableOpacity>

      <View style={styles.toggleRow}>
        <Text style={styles.label}>
          {isShared ? '✅ Will be shared' : '🔒 Private task'}
        </Text>
        <Switch
          value={isShared}
          onValueChange={setIsShared}
          thumbColor={isShared ? '#28a745' : '#ccc'}
        />
      </View>

      {showDatePicker && (
        <DateTimePicker
          value={dueDate}
          mode="date"
          display={Platform.OS === 'ios' ? 'spinner' : 'default'}
          onChange={(event, selectedDate) => {
            setShowDatePicker(false);
            if (selectedDate) setDueDate(selectedDate);
          }}
        />
      )}

      {showTimePicker && (
        <DateTimePicker
          value={dueTime}
          mode="time"
          display={Platform.OS === 'ios' ? 'spinner' : 'default'}
          onChange={(event, selectedTime) => {
            setShowTimePicker(false);
            if (selectedTime) setDueTime(selectedTime);
          }}
        />
      )}

      <TouchableOpacity style={styles.saveButton} onPress={handleAddTask}>
        <Text style={styles.saveButtonText}>💾 Save Task</Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

export default AddTaskScreen;

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    padding: 20,
    backgroundColor: 'white',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 24,
    textAlign: 'center',
    color: '#333',
  },
  label: {
    fontSize: 16,
    color: '#333',
    marginBottom: 6,
    marginTop: 10,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    padding: 12,
    borderRadius: 8,
    fontSize: 16,
    color: '#000',
    marginBottom: 10,
  },
  dateButton: {
    padding: 12,
    backgroundColor: '#f0f0f0',
    borderRadius: 8,
    marginBottom: 16,
  },
  dateText: {
    fontSize: 16,
    color: '#333',
  },
  toggleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginVertical: 12,
  },
  saveButton: {
    backgroundColor: '#28a745',
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 20,
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
});
