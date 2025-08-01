import React, { useContext, useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { ActivityIndicator, View } from 'react-native';

// Contexts
import { AuthProvider, AuthContext } from './src/contexts/AuthContext';

// Notification
import notifee, { EventType } from '@notifee/react-native';
import { createNotificationChannel } from './src/utils/notificationHelper';
import { navigationRef } from './src/navigations/NavigationService';


// Screens
import WelcomeScreen from './screens/WelcomeScreen';
import LoginScreen from './screens/LoginScreen';
import RegisterScreen from './screens/RegisterScreen';
import AddTaskScreen from './screens/AddTaskScreen';
import TaskListScreen from './screens/TaskListScreen';
import EditTaskScreen from './screens/EditTaskScreen';
import TrackExpense from './screens/TrackExpense';
import HomeScreen from './screens/HomeScreen';
import AddExpenseScreen from './screens/AddExpenseScreen';
import EditExpenseScreen from './screens/EditExpenseScreen';
import NotificationsScreen from './screens/NotificationScreen';
import StopRingtoneScreen from './screens/StopRingtonScreen';// ✅ New




// Stack Param List
export type RootStackParamList = {
  Welcome: undefined;
  Login: undefined;
  Register: undefined;
  Home: undefined;
  AddTask: undefined;
  TaskList: undefined;
  EditTask: { id: number; name: string; is_shared: boolean };
  TrackExpense: undefined;
  AddExpense: undefined;
  EditExpense: undefined;
  Notifications: undefined;
  StopRingtone: undefined; // ✅ New screen
};

const Stack = createNativeStackNavigator<RootStackParamList>();

// 🔐 Main navigation
const MainNavigator = () => {
  const { user, loading } = useContext(AuthContext);

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#28a745" />
      </View>
    );
  }

  return (
    <Stack.Navigator>
      {user ? (
        <>
          <Stack.Screen name="Home" component={HomeScreen} />
          <Stack.Screen name="AddTask" component={AddTaskScreen} />
          <Stack.Screen name="TaskList" component={TaskListScreen} />
          <Stack.Screen name="EditTask" component={EditTaskScreen} />
          <Stack.Screen name="AddExpense" component={AddExpenseScreen} />
          <Stack.Screen name="TrackExpense" component={TrackExpense} />
          <Stack.Screen name="EditExpense" component={EditExpenseScreen} />
          <Stack.Screen name="Notifications" component={NotificationsScreen} />
          <Stack.Screen name="StopRingtone" component={StopRingtoneScreen} /> {/* ✅ Add */}
        </>
      ) : (
        <>
          <Stack.Screen name="Welcome" component={WelcomeScreen} />
          <Stack.Screen name="Login" component={LoginScreen} />
          <Stack.Screen name="Register" component={RegisterScreen} />
        </>
      )}
    </Stack.Navigator>
  );
};

const App = () => {
  useEffect(() => {
    createNotificationChannel();

    const unsubscribe = notifee.onForegroundEvent(({ type }) => {
      if (type === EventType.PRESS) {
        navigationRef.current?.navigate('StopRingtone');
      }
    });

    return () => unsubscribe();
  }, []);

  return (
    <AuthProvider>
      <NavigationContainer ref={navigationRef}>
        <MainNavigator />
      </NavigationContainer>
    </AuthProvider>
  );
};

export default App;
