import React, { useEffect } from 'react';
import { View, ActivityIndicator } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { StackScreenProps } from '@react-navigation/stack';

type RootStackParamList = {
  signin: undefined;
  logout: undefined;
};

type Props = StackScreenProps<RootStackParamList, 'logout'>;

const Logout: React.FC<Props> = ({ navigation }) => {
  useEffect(() => {
    const logoutUser = async () => {
      // Clear session storage
      await AsyncStorage.removeItem('userSession');
      await AsyncStorage.removeItem('lastRoute');

      // Reset navigation stack so user can't go back
      navigation.reset({
        index: 0,
        routes: [{ name: 'signin' }],
      });
    };

    logoutUser();
  }, []);

  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      <ActivityIndicator size="large" />
    </View>
  );
};

export default Logout;
