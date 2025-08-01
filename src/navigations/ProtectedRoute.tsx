import React, { useContext } from 'react';
import { View, ActivityIndicator } from 'react-native';
import { AuthContext } from '../contexts/AuthContext';
import { NavigationProp, useNavigation } from '@react-navigation/native';
import { useEffect } from 'react';

interface Props {
  children: React.ReactNode;
}

const ProtectedRoute = ({ children }: Props) => {
  const { token } = useContext(AuthContext);
  const navigation = useNavigation<NavigationProp<any>>();

  useEffect(() => {
    if (!token) {
      navigation.reset({
        index: 0,
        routes: [{ name: 'Login' }],
      });
    }
  }, [token]);

  if (!token) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#007bff" />
      </View>
    );
  }

  return <>{children}</>;
};

export default ProtectedRoute;
