import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  ActivityIndicator,
  SafeAreaView,
  Alert,
  TouchableOpacity,
} from 'react-native';

import { useIsFocused } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const ExpenseListScreen = ({ navigation }: any) => {
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(true);
  const isFocused = useIsFocused();

  const fetchExpenses = async () => {
    setLoading(true);
    try {
      const token = await AsyncStorage.getItem('token');
      if (!token) throw new Error('Unauthorized');

      const response = await fetch('http://192.168.1.109:8000/api/expenses', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json',
        },
      });

      if (!response.ok) {
        const err = await response.json();
        console.error('❌ Error:', err);
        throw new Error(err.message || 'Failed to fetch expenses');
      }

      const data = await response.json();
      setExpenses(data);
    } catch (error: any) {
      console.error('Error fetching expenses:', error);
      Alert.alert('Error', error.message || 'Failed to load expenses');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isFocused) {
      fetchExpenses();
    }
  }, [isFocused]);

  const handleDelete = (id: number) => {
    Alert.alert('Confirm Delete', 'Are you sure you want to delete this expense?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          try {
            const token = await AsyncStorage.getItem('token');
            if (!token) throw new Error('Unauthorized');

            const res = await fetch(`http://192.168.1.109:8000/api/expenses/${id}`, {
              method: 'DELETE',
              headers: {
                'Authorization': `Bearer ${token}`,
                'Accept': 'application/json',
              },
            });

            if (!res.ok) throw new Error('Delete failed');

            setExpenses(prev => prev.filter(item => item.id !== id));
            Alert.alert('Deleted', 'Expense deleted successfully.');
          } catch (error) {
            console.error('❌ Error deleting expense:', error);
            Alert.alert('Error', 'Could not delete expense.');
          }
        },
      },
    ]);
  };

  const renderItem = ({ item }: any) => (
    <View style={styles.card}>
      <Text style={styles.title}>
        {item.title} - Rs. {item.amount}
      </Text>
      <Text style={styles.detail}>Paid by: {item.paid_by}</Text>
      <Text style={styles.detail}>Date: {item.date}</Text>
      {item.note ? <Text style={styles.note}>Note: {item.note}</Text> : null}

      <View style={styles.buttonRow}>
        <TouchableOpacity
          style={styles.editButton}
          onPress={() => navigation.navigate('EditExpense', { expense: item })}
        >
          <Text style={styles.buttonText}>Edit</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.deleteButton}
          onPress={() => handleDelete(item.id)}
        >
          <Text style={styles.buttonText}>Delete</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.heading}>All Expenses</Text>

      {loading ? (
        <ActivityIndicator size="large" color="#0000ff" />
      ) : expenses.length === 0 ? (
        <Text>No expenses found.</Text>
      ) : (
        <FlatList
          data={expenses}
          keyExtractor={item => item.id.toString()}
          renderItem={renderItem}
        />
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#fff',
  },
  heading: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  card: {
    padding: 15,
    borderRadius: 10,
    backgroundColor: '#f2f2f2',
    marginBottom: 15,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: 'blue',
  },
  detail: {
    fontSize: 14,
    color: '#555',
  },
  note: {
    fontStyle: 'italic',
    marginTop: 4,
    color: '#888',
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 10,
  },
  editButton: {
    backgroundColor: '#007bff',
    padding: 8,
    borderRadius: 6,
    marginRight: 10,
  },
  deleteButton: {
    backgroundColor: '#dc3545',
    padding: 8,
    borderRadius: 6,
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
});

export default ExpenseListScreen;
