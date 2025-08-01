import React, { useContext } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Share,
  Alert,
} from 'react-native';
import Clipboard from '@react-native-clipboard/clipboard';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../App';
import { AuthContext } from '../src/contexts/AuthContext';
import ProtectedRoute from '../src/navigations/ProtectedRoute';

type Props = {
  navigation: NativeStackNavigationProp<RootStackParamList, 'Home'>;
};

const HomeScreen = ({ navigation }: Props) => {
  const { user, logout } = useContext(AuthContext);

  const handleShareCode = async () => {
    try {
      const message = `Join my group on Daily Organizer using this code: ${user?.group_code}`;
      await Share.share({ message });
    } catch (error) {
      Alert.alert('Error', 'Could not share the code.');
      console.error('❌ Share Error:', error);
    }
  };

  const handleCopyCode = () => {
    if (user?.group_code) {
      Clipboard.setString(user.group_code);
      Alert.alert('Copied', 'Group code copied to clipboard!');
    }
  };

  return (
    <ProtectedRoute>
      <View style={styles.container}>
        <Text style={styles.heading}>📝 Daily Organizer</Text>
        <Text style={styles.welcomeText}>Welcome, {user?.name || 'User'} 👋</Text>

        <Text style={styles.groupCode}>Group Code: {user?.group_code}</Text>

        <View style={styles.actionRow}>
          <TouchableOpacity onPress={handleCopyCode}>
            <Text style={styles.link}>📋 Copy Code</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={handleShareCode}>
            <Text style={styles.link}>🔗 Share</Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity
          style={styles.button}
          onPress={() => navigation.navigate('AddTask')}
        >
          <Text style={styles.buttonText}>Add Task</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.button}
          onPress={() => navigation.navigate('TaskList')}
        >
          <Text style={styles.buttonText}>Task List</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.button}
          onPress={() => navigation.navigate('TrackExpense')}
        >
          <Text style={styles.buttonText}>Track Expenses</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.button}
          onPress={() => navigation.navigate('AddExpense')}
        >
          <Text style={styles.buttonText}>Add Expense</Text>
        </TouchableOpacity>

        {/* ✅ New Button for Notification Screen */}
        <TouchableOpacity
          style={styles.button}
          onPress={() => navigation.navigate('Notifications')}
        >
          <Text style={styles.buttonText}>🔔 View Notifications</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.button, styles.logoutButton]}
          onPress={logout}
        >
          <Text style={styles.buttonText}>Logout</Text>
        </TouchableOpacity>
      </View>
    </ProtectedRoute>
  );
};

export default HomeScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#f2f2f2',
  },
  heading: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#1a1a1a',
    backgroundColor: '#e0e0e0',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 10,
    overflow: 'hidden',
    elevation: 2,
    textAlign: 'center',
  },
  welcomeText: {
    fontSize: 18,
    color: '#333',
    marginBottom: 10,
  },
  groupCode: {
    fontSize: 16,
    color: '#555',
    marginBottom: 4,
  },
  actionRow: {
    flexDirection: 'row',
    gap: 20,
    marginBottom: 20,
  },
  link: {
    color: '#007bff',
    fontSize: 16,
  },
  button: {
    backgroundColor: '#007bff',
    paddingVertical: 14,
    paddingHorizontal: 32,
    borderRadius: 12,
    marginVertical: 8,
    width: '80%',
    alignItems: 'center',
    elevation: 3,
  },
  logoutButton: {
    backgroundColor: '#dc3545',
    marginTop: 30,
  },
  buttonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: '600',
  },
});
