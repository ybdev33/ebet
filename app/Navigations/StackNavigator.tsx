import React, { useState, useEffect, useRef } from "react";
import { createStackNavigator, CardStyleInterpolators } from '@react-navigation/stack';
import { StatusBar, Platform } from "react-native";
import { useTheme, NavigationContainerRef } from "@react-navigation/native";
import AsyncStorage from '@react-native-async-storage/async-storage';

import SignIn from '../screens/Auth/signin';
import SignUp from '../screens/Auth/signup';
import Logout from '../screens/Auth/logout';
import EmailVerify from '../screens/Auth/emailverify';
import DrawerNavigation from "./DrawerNavigation";
import Account from '../screens/Account';
import History from '../screens/history';
import Referral from '../screens/referral';
import BetPicker from "../screens/betPicker";
import Users from '../screens/users';
import PrinterScreen from '../screens/printerScreen';
import { getSession } from '../helpers/sessionHelper';
import Constants from 'expo-constants';

const Stack = createStackNavigator();

const { GAMING_NAME } = Constants.expoConfig?.extra || {};

// Utility: Get deepest active route recursively
const getActiveRoutePath = (state: any): string => {
  if (!state || !state.routes || state.index == null) return '';
  const route = state.routes[state.index];
  if (route.state) {
    return `${route.name}/${getActiveRoutePath(route.state)}`;
  }
  return route.name;
};

const StackNavigator: React.FC = () => {
  const { colors, dark } = useTheme();
  const [initialRoute, setInitialRoute] = useState<string | null>(null);
  const [session, setSession] = useState<any>(null);
  const [loaded, setLoaded] = useState(false);

  // FIX: make safeLastRoute available globally
  const [savedPath, setSavedPath] = useState<string>("drawernavigation/BottomNavigation/Home");

  const navigationRef = useRef<NavigationContainerRef>(null);

  useEffect(() => {
    const initialize = async () => {
      try {
        const savedSession = await getSession('userSession');
        setSession(savedSession);

        const rawLastRoute = await AsyncStorage.getItem('lastRoute');

        // compute safe path
        const safe = rawLastRoute || "drawernavigation/BottomNavigation/Home";

        setSavedPath(safe);

        if (savedSession) {
          const topRoute = safe.split('/')[0];

          if (topRoute === 'drawernavigation') {
            // slight delay so initialRoute attaches first
            setInitialRoute("drawernavigation");

            setTimeout(() => {
              const paths = safe.split('/');
              navigationRef.current?.navigate('drawernavigation', {
                screen: paths[1],
                params: { screen: paths[2] }
              });
            }, 50);

            return;
          } else {
            setInitialRoute(safe);
          }
        } else {
          setInitialRoute('signin');
        }
      } catch (err) {
        console.error('Failed to load session:', err);
        setInitialRoute('signin');
      } finally {
        setLoaded(true);
      }
    };

    initialize();
  }, []);

  const routeTitleMap: Record<string, string> = {
    Home: 'Home',
    drawernavigation: 'Home',
    Account: 'Account',
    History: 'History',
    Referral: 'Referral',
    Users: 'Users',
    PrinterScreen: 'Printer',
  };

  // Save actual route changes
  const handleStateChange = async (state: any) => {
    if (!state) return;

    const fullPath = getActiveRoutePath(state);

    if (fullPath) {
      await AsyncStorage.setItem('lastRoute', fullPath);

      if (Platform.OS === 'web') {
        const parts = fullPath.split('/');
        const last = parts[parts.length - 1];

        document.title = `${routeTitleMap[last] || last} | ${GAMING_NAME}`;
      }
    }
  };

  if (!loaded || !initialRoute) return null;

  return (
    <>
      <StatusBar
        translucent
        backgroundColor="transparent"
        barStyle={dark ? "light-content" : "dark-content"}
      />

      <Stack.Navigator
        initialRouteName={initialRoute}
        screenOptions={{
          headerShown: false,
          cardStyle: { backgroundColor: colors.background },
          cardStyleInterpolator: CardStyleInterpolators.forHorizontalIOS,
        }}
        screenListeners={{
          state: e => handleStateChange(e.data.state),
        }}
      >
        {/* Auth */}
        <Stack.Screen name="signin" component={SignIn} />
        <Stack.Screen name="emailverify" component={EmailVerify} />
        <Stack.Screen name="register" component={SignUp} />
        <Stack.Screen name="logout" component={Logout} />

        {/* Main */}
        <Stack.Screen
          name="drawernavigation"
          component={DrawerNavigation}
          initialParams={{
            screen: savedPath.split('/')[1] || 'BottomNavigation',
            params: {
              screen: savedPath.split('/')[2] || 'Home',
            },
          }}
        />

        <Stack.Screen name="account" component={Account} />
        <Stack.Screen name="history" component={History} />
        <Stack.Screen name="referral" component={Referral} />
        <Stack.Screen name="betPicker" component={BetPicker} />
        <Stack.Screen name="users" component={Users} />
        <Stack.Screen name="printerScreen" component={PrinterScreen} />
      </Stack.Navigator>
    </>
  );
};

export default StackNavigator;
