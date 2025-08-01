import React, { useState, useContext } from 'react';
import {
  View,
  Text,
  TextInput,
  Button,
  StyleSheet,
  Alert,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  TouchableOpacity,
} from 'react-native';
import API from '../src/api';
import { Picker } from '@react-native-picker/picker';
import { AuthContext } from '../src/contexts/AuthContext';

const generateGroupCode = () => {
  return 'GC-' + Math.random().toString(36).substring(2, 8).toUpperCase();
};

const RegisterScreen = ({ navigation }: any) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [groupCode, setGroupCode] = useState(generateGroupCode());
  const [relationshipType, setRelationshipType] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState<any>({});
  const { login } = useContext(AuthContext);

  const validate = () => {
    let valid = true;
    const newErrors: any = {};

    if (!name.trim()) {
      newErrors.name = 'Name is required';
      valid = false;
    } else if (name.trim().length < 5) {
      newErrors.name = 'Name must be at least 5 characters';
      valid = false;
    }

    if (!email.trim()) {
      newErrors.email = 'Email is required';
      valid = false;
    }

    if (!password) {
      newErrors.password = 'Password is required';
      valid = false;
    }

    if (!confirmPassword) {
      newErrors.confirmPassword = 'Confirm your password';
      valid = false;
    } else if (password !== confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
      valid = false;
    }

    if (!groupCode.trim()) {
      newErrors.groupCode = 'Group Code is required';
      valid = false;
    }

    if (!relationshipType) {
      newErrors.relationshipType = 'Please select a role';
      valid = false;
    }

    setErrors(newErrors);
    return valid;
  };

  const handleRegister = async () => {
    if (!validate()) return;

    const payload = {
      name,
      email,
      password,
      password_confirmation: confirmPassword,
      group_code: groupCode,
      relationship_type: relationshipType,
    };

    console.log('📤 Sending to backend:', payload);

    try {
      const response = await API.post('/register', payload);

      console.log('✅ Register response:', response.data);

      await login(response.data.user, response.data.token);
      Alert.alert('Success', 'Registered successfully!');
    } catch (error: any) {
      console.log('❌ Register error:', error);
      console.log('❌ Full error response:', error?.response?.data);
      console.log('❌ Error message:', error?.message);

      Alert.alert(
        'Error',
        error?.response?.data?.message ||
          error?.response?.data?.errors?.email?.[0] ||
          error?.response?.data?.errors?.name?.[0] ||
          'Registration failed'
      );
    }
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.title}>Create an Account</Text>

        <TextInput
          placeholder="Full Name *"
          style={styles.input}
          value={name}
          onChangeText={setName}
          placeholderTextColor="#888"
        />
        {errors.name && <Text style={styles.error}>{errors.name}</Text>}

        <TextInput
          placeholder="Email *"
          style={styles.input}
          value={email}
          onChangeText={setEmail}
          autoCapitalize="none"
          keyboardType="email-address"
          placeholderTextColor="#888"
        />
        {errors.email && <Text style={styles.error}>{errors.email}</Text>}

        <TextInput
          placeholder="Password *"
          style={styles.input}
          value={password}
          onChangeText={setPassword}
          secureTextEntry={!showPassword}
          placeholderTextColor="#888"
        />
        {errors.password && <Text style={styles.error}>{errors.password}</Text>}

        <TextInput
          placeholder="Confirm Password *"
          style={styles.input}
          value={confirmPassword}
          onChangeText={setConfirmPassword}
          secureTextEntry={!showPassword}
          placeholderTextColor="#888"
        />
        {errors.confirmPassword && (
          <Text style={styles.error}>{errors.confirmPassword}</Text>
        )}

        <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
          <Text style={{ color: 'blue', marginBottom: 10, textAlign: 'right' }}>
            {showPassword ? 'Hide Password' : 'Show Password'}
          </Text>
        </TouchableOpacity>

        <TextInput
          placeholder="Group Code (share with partner/roommates)"
          style={styles.input}
          value={groupCode}
          onChangeText={setGroupCode}
          placeholderTextColor="#888"
        />
        {errors.groupCode && <Text style={styles.error}>{errors.groupCode}</Text>}

        <TouchableOpacity
          onPress={() => setGroupCode(generateGroupCode())}
          style={{ marginBottom: 10 }}
        >
          <Text style={{ color: 'green', fontWeight: 'bold' }}>
            🔄 Regenerate Code
          </Text>
        </TouchableOpacity>

        <View style={styles.pickerWrapper}>
          <Picker
            selectedValue={relationshipType}
            onValueChange={value => setRelationshipType(value)}
            style={styles.picker}
          >
            <Picker.Item label="Select Role" value="" />
            <Picker.Item label="Roommate" value="Roommate" />
            <Picker.Item label="Partner" value="Partner" />
          </Picker>
        </View>
        {errors.relationshipType && (
          <Text style={styles.error}>{errors.relationshipType}</Text>
        )}

        <Button title="Register" onPress={handleRegister} color="#28a745" />

        <Text style={styles.link} onPress={() => navigation.navigate('Login')}>
          Already have an account? Login
        </Text>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

export default RegisterScreen;

const styles = StyleSheet.create({
  container: {
    padding: 20,
    justifyContent: 'center',
    flexGrow: 1,
    backgroundColor: '#f2f2f2',
  },
  title: {
    fontSize: 26,
    fontWeight: 'bold',
    marginBottom: 25,
    textAlign: 'center',
    color: '#333',
  },
  input: {
    borderWidth: 1,
    borderColor: '#bbb',
    backgroundColor: '#fff',
    padding: 14,
    borderRadius: 10,
    marginBottom: 8,
    fontSize: 16,
    color: '#000',
  },
  error: {
    color: 'red',
    marginBottom: 8,
    marginLeft: 4,
    fontSize: 13,
  },
  link: {
    marginTop: 20,
    color: '#007bff',
    textAlign: 'center',
    fontSize: 16,
  },
  pickerWrapper: {
    borderWidth: 1,
    borderColor: '#bbb',
    borderRadius: 10,
    marginBottom: 20,
    backgroundColor: '#fff',
  },
  picker: {
    height: 50,
    color: '#000',
  },
});
