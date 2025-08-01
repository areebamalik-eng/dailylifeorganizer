import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  Button,
  StyleSheet,
  Alert,
  TouchableOpacity,
} from 'react-native';
import { RouteProp, useNavigation, useRoute } from '@react-navigation/native';
import { RootStackParamList } from '../App';

type RouteParams = RouteProp<RootStackParamList, 'EditTask'>;

const EditTaskScreen = () => {
  const route = useRoute<RouteParams>();
  const navigation = useNavigation();
  const { id, name: initialName, is_shared: initialShared } = route.params;

  const [name, setName] = useState(initialName);
  const [isShared, setIsShared] = useState<boolean>(initialShared ?? false);

  const handleUpdate = async () => {
    try {
      const response = await fetch(`http://192.168.1.109:8000/api/tasks/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name, is_shared: isShared }),
      });

      if (!response.ok) throw new Error('Update failed');

      await response.json();
      Alert.alert('Success', 'Task updated');
      navigation.goBack();
    } catch (error) {
      console.error(error);
      Alert.alert('Error', 'Failed to update task');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.label}>Edit Task:</Text>
      <TextInput
        style={styles.input}
        value={name}
        onChangeText={setName}
        placeholder="Task name"
        placeholderTextColor="#aaa"
      />

      <TouchableOpacity
        onPress={() => setIsShared(prev => !prev)}
        style={styles.checkboxRow}
      >
        <View style={[styles.checkbox, isShared && styles.checkedBox]}>
          {isShared && <Text style={styles.checkMark}>✓</Text>}
        </View>
        <Text style={styles.checkboxLabel}>Share this task with group</Text>
      </TouchableOpacity>

      <Button title="Update Task" onPress={handleUpdate} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { padding: 20 },
  label: { fontSize: 18, marginBottom: 10 },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    padding: 12,
    marginBottom: 20,
    borderRadius: 6,
    color: '#000',
  },
  checkboxRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderWidth: 2,
    borderColor: '#007bff',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  checkedBox: {
    backgroundColor: '#007bff',
  },
  checkMark: {
    color: '#fff',
    fontWeight: 'bold',
  },
  checkboxLabel: {
    fontSize: 16,
    color: '#333',
  },
});

export default EditTaskScreen;
