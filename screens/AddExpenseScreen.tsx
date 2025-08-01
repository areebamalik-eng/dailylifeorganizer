import React, { useState } from 'react';
import {
  View,
  TextInput,
  Button,
  StyleSheet,
  Alert,
  ScrollView,
  Text,
  ActivityIndicator,
  Switch,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const AddExpenseScreen = ({ navigation }: any) => {
  const [title, setTitle] = useState('');
  const [amount, setAmount] = useState('');
  const [paidBy, setPaidBy] = useState('');
  const [category, setCategory] = useState('');
  const [date, setDate] = useState('');
  const [note, setNote] = useState('');
  const [isShared, setIsShared] = useState(false); 
  const [loading, setLoading] = useState(false);

  const formatDate = (inputDate: string) => {
    const parts = inputDate.split('-');
    if (parts.length === 3) {
      const [day, month, year] = parts;
      return `${year}-${month}-${day}`;
    }
    return inputDate;
  };

  const handleAddExpense = async () => {
    if (!title.trim() || !amount.trim() || !paidBy.trim() || !date.trim()) {
      Alert.alert('Missing Fields', 'Please fill in all required fields marked with *');
      return;
    }

    const formattedDate = formatDate(date.trim());

    const expenseData = {
      title: title.trim(),
      amount: parseFloat(amount) || 0,
      paid_by: paidBy.trim(),
      category: category.trim(),
      date: formattedDate,
      note: note.trim(),
      is_shared: isShared, 
    };

    console.log('📦 Sending Expense:', expenseData);
    setLoading(true);

    try {
      const token = await AsyncStorage.getItem('token');
      if (!token) {
        setLoading(false);
        Alert.alert('Authentication Error', 'User not authenticated. Please log in again.');
        return;
      }

      const response = await fetch('http://192.168.1.109:8000/api/expenses', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(expenseData),
      });

      setLoading(false);

      if (!response.ok) {
        const error = await response.json();
        console.log('❌ Server Error:', error);
        throw new Error(error.message || 'Failed to add expense');
      }

      const data = await response.json();
      Alert.alert('Success', '✅ Expense added successfully!');
      // Reset form
      setTitle('');
      setAmount('');
      setPaidBy('');
      setCategory('');
      setDate('');
      setNote('');
      setIsShared(false);

      navigation.goBack();
    } catch (error: any) {
      setLoading(false);
      console.error('Error:', error);
      Alert.alert('Error', error.message || '❌ Failed to add expense. Check fields or server.');
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.heading}>Add Expense</Text>

      <TextInput
        style={styles.input}
        placeholder="Title *"
        placeholderTextColor="#888"
        value={title}
        onChangeText={setTitle}
      />
      <TextInput
        style={styles.input}
        placeholder="Amount * (e.g. 1000)"
        placeholderTextColor="#888"
        value={amount}
        onChangeText={setAmount}
        keyboardType="numeric"
      />
      <TextInput
        style={styles.input}
        placeholder="Paid By * (e.g. Areeba or Ahad)"
        placeholderTextColor="#888"
        value={paidBy}
        onChangeText={setPaidBy}
      />
      <TextInput
        style={styles.input}
        placeholder="Category (e.g. Food, Travel)"
        placeholderTextColor="#888"
        value={category}
        onChangeText={setCategory}
      />
      <TextInput
        style={styles.input}
        placeholder="Date * (DD-MM-YYYY)"
        placeholderTextColor="#888"
        value={date}
        onChangeText={setDate}
      />
      <TextInput
        style={[styles.input, styles.noteInput]}
        placeholder="Note (optional)"
        placeholderTextColor="#888"
        value={note}
        onChangeText={setNote}
        multiline
      />

      {/* ✅ Shared Toggle */}
      <View style={styles.toggleRow}>
        <Text style={styles.label}>Share with Partner/Roommate:</Text>
        <Switch
          value={isShared}
          onValueChange={setIsShared}
          thumbColor={isShared ? '#28a745' : '#ccc'}
        />
      </View>

      {loading ? (
        <ActivityIndicator size="large" color="#007bff" style={{ marginTop: 10 }} />
      ) : (
        <Button title="Add Expense" onPress={handleAddExpense} color="#007bff" />
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 20,
    backgroundColor: '#f7f7f7',
    flexGrow: 1,
  },
  heading: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 25,
    textAlign: 'center',
    color: '#333',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    padding: 12,
    borderRadius: 8,
    marginBottom: 15,
    backgroundColor: '#fff',
    fontSize: 16,
    color: '#000',
  },
  noteInput: {
    height: 100,
    textAlignVertical: 'top',
  },
  toggleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    color: '#333',
  },
});

export default AddExpenseScreen;
