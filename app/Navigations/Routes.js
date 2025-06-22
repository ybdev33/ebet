import React, { useState } from "react";
import { 
  NavigationContainer, 
  DefaultTheme as NavigationDefaultTheme,
  DarkTheme as NavigationDarkTheme
} from '@react-navigation/native';
import StackNavigator from "./StackNavigator";
import { SafeAreaProvider } from "react-native-safe-area-context";
import themeContext from "../constants/themeContext";
import { COLORS } from "../constants/theme";
import * as Linking from 'expo-linking';

const Routes = () => {
  const [isDarkTheme, setIsDarkTheme] = useState(true);
  const authContext = React.useMemo(() => ({
    setDarkTheme: () => {
      setIsDarkTheme(true);
    },
    setLightTheme: () => {
      setIsDarkTheme(false);
    }
  }), []);

  const CustomDefaultTheme = {
    ...NavigationDefaultTheme,
    colors: {
      ...NavigationDefaultTheme.colors,
      background: COLORS.background,
      title : COLORS.title,
      card : COLORS.card,
      text : COLORS.text,
      borderColor : COLORS.border,
    }
}

const CustomDarkTheme = {
    ...NavigationDarkTheme,
    colors: {
        ...NavigationDarkTheme.colors,
      background: COLORS.darkBackground,
      title : COLORS.darkTitle,
      card : COLORS.darkCard,
      text : COLORS.darkText,
      borderColor : COLORS.darkBorder,
    }
  }
  
  const theme = isDarkTheme ? CustomDarkTheme : CustomDefaultTheme;

  const linking = {
    prefixes: [
      Linking.createURL('/'),
      'ebet://',
    ],
    config: {
      screens: {
        register: {
          path: 'register/:referralCode/:userType',
          parse: {
            referralCode: (referralCode) => referralCode,
            userType: (userType) => userType,
          },
        },
      },
    },
  };

  return (
    <SafeAreaProvider>
      <themeContext.Provider value={authContext}>
        <NavigationContainer theme={theme} linking={linking}>
          <StackNavigator />
        </NavigationContainer>
      </themeContext.Provider>
    </SafeAreaProvider>
  );
};
export default Routes;
