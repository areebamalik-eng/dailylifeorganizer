import React, { useState, useEffect } from 'react';
import {
  View,
  TextInput,
  Button,
  StyleSheet,
  Alert,
  ScrollView,
  Text,
} from 'react-native';

const EditExpenseScreen = ({ route, navigation }: any) => {
  const { expense } = route.params;

  const [title, setTitle] = useState('');
  const [amount, setAmount] = useState('');
  const [paidBy, setPaidBy] = useState('');
  const [category, setCategory] = useState('');
  const [date, setDate] = useState('');
  const [note, setNote] = useState('');

  useEffect(() => {
    if (expense) {
      setTitle(expense.title);
      setAmount(String(expense.amount));
      setPaidBy(expense.paid_by);
      setCategory(expense.category || '');
      setDate(expense.date);
      setNote(expense.note || '');
    }
  }, [expense]);

  const handleUpdate = () => {
    if (!title.trim() || !amount.trim() || !paidBy.trim() || !date.trim()) {
      Alert.alert('Missing Fields', 'Please fill all required fields');
      return;
    }

    const updatedExpense = {
      title: title.trim(),
      amount: parseFloat(amount),
      paid_by: paidBy.trim(),
      category: category.trim(),
      date: date.trim(),
      note: note.trim(),
    };

    fetch(`http://192.168.1.109:8000/api/expenses/${expense.id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(updatedExpense),
    })
      .then(response => {
        if (!response.ok) {
          return response.json().then(err => {
            console.log('❌ Validation errors:', err);
            throw new Error('Failed to update expense');
          });
        }
        return response.json();
      })
      .then(() => {
        Alert.alert('Success', '✅ Expense updated successfully!');
        navigation.goBack();
      })
      .catch(error => {
        console.error('Error updating:', error);
        Alert.alert('Error', '❌ Failed to update expense.');
      });
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.heading}>Edit Expense</Text>

      <TextInput
        style={styles.input}
        placeholder="Title *"
        value={title}
        onChangeText={setTitle}
      />
      <TextInput
        style={styles.input}
        placeholder="Amount *"
        value={amount}
        onChangeText={setAmount}
        keyboardType="numeric"
      />
      <TextInput
        style={styles.input}
        placeholder="Paid By *"
        value={paidBy}
        onChangeText={setPaidBy}
      />
      <TextInput
        style={styles.input}
        placeholder="Category"
        value={category}
        onChangeText={setCategory}
      />
      <TextInput
        style={styles.input}
        placeholder="Date * (YYYY-MM-DD)"
        value={date}
        onChangeText={setDate}
      />
      <TextInput
        style={[styles.input, styles.noteInput]}
        placeholder="Note"
        value={note}
        onChangeText={setNote}
        multiline
      />

      <Button title="Update Expense" onPress={handleUpdate} color="#28a745" />
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
});

export default EditExpenseScreen;
