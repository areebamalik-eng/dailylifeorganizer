import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  ActivityIndicator,
  Alert,
  TouchableOpacity,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../App';

type Task = {
  id: number;
  name: string;
  is_done: boolean;
  is_shared?: boolean;
  due_date?: string;
  due_time?: string;
  user?: {
    name: string;
  };
};

type Props = {
  navigation: NativeStackNavigationProp<RootStackParamList, 'TaskList'>;
};

const formatDate = (dateString?: string): string => {
  if (!dateString) return '';
  const date = new Date(dateString);
  return date.toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
};

const formatTime = (timeString?: string): string => {
  if (!timeString) return '';
  const [hour, minute] = timeString.split(':');
  const date = new Date();
  date.setHours(Number(hour));
  date.setMinutes(Number(minute));
  return date.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
  });
};

const TaskListScreen = ({ navigation }: Props) => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchTasks = async () => {
  setLoading(true);
  try {
    const token = await AsyncStorage.getItem('token');
    console.log('🔐 Token:', token); // ✅ Check if token is available

    if (!token) throw new Error('No token found');

    const res = await fetch('http://192.168.1.109:8000/api/tasks', {
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    if (!res.ok) {
      const errorData = await res.json();
      console.error('❌ API Error:', errorData);
      throw new Error('Failed to fetch tasks');
    }

    const data = await res.json();
    setTasks(data);
  } catch (err) {
    console.error('❌ Error fetching tasks:', err);
    Alert.alert('Error', 'Failed to load tasks');
  } finally {
    setLoading(false);
  }
};


  useEffect(() => {
    fetchTasks();

    navigation.setOptions({
      headerRight: () => (
        <TouchableOpacity
          onPress={() => navigation.navigate('AddTask')}
          style={{ marginRight: 15 }}
        >
          <Icon name="add-circle-outline" size={28} color="#007bff" />
        </TouchableOpacity>
      ),
    });
  }, []);

  const toggleDone = async (id: number) => {
    try {
      const token = await AsyncStorage.getItem('token');
      await fetch(`http://192.168.1.109:8000/api/tasks/${id}/toggle`, {
        method: 'PATCH',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
      fetchTasks();
    } catch {
      Alert.alert('Error', 'Failed to toggle status');
    }
  };

  const deleteTask = async (id: number) => {
    try {
      const token = await AsyncStorage.getItem('token');
      await fetch(`http://192.168.1.109:8000/api/tasks/${id}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
      Alert.alert('Deleted', 'Task removed successfully');
      fetchTasks();
    } catch {
      Alert.alert('Error', 'Could not delete task');
    }
  };

  const markAllAsDone = async () => {
    const token = await AsyncStorage.getItem('token');
    Promise.all(
      tasks
        .filter(task => !task.is_done)
        .map(task =>
          fetch(`http://192.168.1.109:8000/api/tasks/${task.id}/toggle`, {
            method: 'PATCH',
            headers: {
              Authorization: `Bearer ${token}`,
              'Content-Type': 'application/json',
            },
          })
        )
    )
      .then(() => fetchTasks())
      .catch(() => Alert.alert('Error', 'Could not mark all as done'));
  };

  const deleteAllTasks = async () => {
    const token = await AsyncStorage.getItem('token');
    Alert.alert('Confirm', 'Are you sure you want to delete all tasks?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete All',
        style: 'destructive',
        onPress: async () => {
          Promise.all(
            tasks.map(task =>
              fetch(`http://192.168.1.109:8000/api/tasks/${task.id}`, {
                method: 'DELETE',
                headers: {
                  Authorization: `Bearer ${token}`,
                  'Content-Type': 'application/json',
                },
              })
            )
          )
            .then(() => fetchTasks())
            .catch(() => Alert.alert('Error', 'Could not delete all'));
        },
      },
    ]);
  };

  const renderItem = ({ item }: { item: Task }) => (
    <View style={styles.taskContainer}>
      <View style={styles.taskTextContainer}>
        <Text style={[styles.taskName, item.is_done && styles.doneText]}>
          {item.name} {item.is_shared && <Text style={{ color: 'blue' }}>(Shared)</Text>}
        </Text>
        <Text style={styles.dateText}>
          {formatDate(item.due_date)} {formatTime(item.due_time)}
        </Text>
        {item.user?.name && (
          <Text style={styles.ownerText}>👤 {item.user.name}</Text>
        )}
      </View>

      <View style={styles.iconRow}>
        <TouchableOpacity onPress={() => toggleDone(item.id)}>
          <Icon
            name={item.is_done ? 'check-circle' : 'radio-button-unchecked'}
            size={24}
            color={item.is_done ? 'green' : 'gray'}
            style={styles.icon}
          />
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() =>
            navigation.navigate('EditTask', {
              id: item.id,
              name: item.name,
              is_shared: !!item.is_shared,
            })
          }
        >
          <Icon name="edit" size={24} color="#007bff" style={styles.icon} />
        </TouchableOpacity>
        <TouchableOpacity onPress={() => deleteTask(item.id)}>
          <Icon name="delete" size={24} color="#dc3545" style={styles.icon} />
        </TouchableOpacity>
      </View>
    </View>
  );

  if (loading)
    return (
      <ActivityIndicator size="large" color="#0000ff" style={{ marginTop: 20 }} />
    );

  return (
    <View style={styles.container}>
      <View style={styles.actionsRow}>
        <TouchableOpacity style={styles.actionButton} onPress={markAllAsDone}>
          <Icon name="done-all" size={20} color="white" />
          <Text style={styles.actionText}>Mark All Done</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.actionButton, { backgroundColor: '#dc3545' }]}
          onPress={deleteAllTasks}
        >
          <Icon name="delete-sweep" size={20} color="white" />
          <Text style={styles.actionText}>Delete All</Text>
        </TouchableOpacity>
      </View>

      {tasks.length === 0 ? (
        <Text style={styles.emptyText}>No tasks found. Add some!</Text>
      ) : (
        <FlatList
          data={tasks}
          keyExtractor={item => item.id.toString()}
          renderItem={renderItem}
          contentContainerStyle={{ paddingBottom: 30 }}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: '#f4f4f4' },
  taskContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 10,
    marginBottom: 10,
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  taskTextContainer: {
    flex: 1,
    marginRight: 10,
  },
  taskName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  dateText: {
    fontSize: 12,
    color: '#777',
    marginTop: 4,
  },
  ownerText: {
    fontSize: 12,
    color: '#555',
    marginTop: 4,
    fontStyle: 'italic',
  },
  doneText: {
    textDecorationLine: 'line-through',
    color: 'green',
  },
  iconRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  icon: {
    marginLeft: 8,
  },
  actionsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#28a745',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 25,
    elevation: 2,
  },
  actionText: {
    color: 'white',
    marginLeft: 8,
    fontWeight: 'bold',
  },
  emptyText: {
    textAlign: 'center',
    color: '#999',
    marginTop: 50,
    fontSize: 16,
  },
});

export default TaskListScreen;
