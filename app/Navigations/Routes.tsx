import React, { useState, useMemo, useRef } from "react";
import {
    NavigationContainer,
    DefaultTheme as NavigationDefaultTheme,
    DarkTheme as NavigationDarkTheme
} from '@react-navigation/native';
import StackNavigator from "./StackNavigator";
import themeContext from "../constants/themeContext";
import { COLORS } from "../constants/theme";
import * as Linking from 'expo-linking';
import { getSession } from '../helpers/sessionHelper';

const Routes = () => {
    const [isDarkTheme, setIsDarkTheme] = useState(true);
 const navigationRef = useRef<NavigationContainerRef>(null);

    const authContext = useMemo(() => ({
        setDarkTheme: () => setIsDarkTheme(true),
        setLightTheme: () => setIsDarkTheme(false),
    }), []);

    const CustomDefaultTheme = {
        ...NavigationDefaultTheme,
        colors: {
            ...NavigationDefaultTheme.colors,
            background: COLORS.background,
            title: COLORS.title,
            card: COLORS.card,
            text: COLORS.text,
            borderColor: COLORS.border,
        }
    };

    const CustomDarkTheme = {
        ...NavigationDarkTheme,
        colors: {
            ...NavigationDarkTheme.colors,
            background: COLORS.darkBackground,
            title: COLORS.darkTitle,
            card: COLORS.darkCard,
            text: COLORS.darkText,
            borderColor: COLORS.darkBorder,
        }
    };

    const theme = isDarkTheme ? CustomDarkTheme : CustomDefaultTheme;

    const linking = {
        prefixes: ['https://allswerte.com:6030', 'ebet://'],

        config: {
            screens: {
                register: 'register/:referralCode?/:userType?',
            },
        },

        // Prevent deep link override when logged in
        async getInitialURL() {
            try {
                const url = await Linking.getInitialURL();
                const session = await getSession('userSession');

                if (session) {
                    if (url?.includes('/register') || url?.includes('/signin')) {
                        return null; // ignore unauthorized deeplinks
                    }
                }

                return url;
            } catch {
                return null;
            }
        },
    };

    return (
        <themeContext.Provider value={authContext}>
            <NavigationContainer
                ref={navigationRef} // <-- REQUIRED
                theme={theme}
                linking={linking}
                onReady={async () => {
                    const url = await Linking.getInitialURL();
                    const session = await getSession('userSession');

                    if (session && url) {
                        if (url.includes('/register') || url.includes('/signin')) {
                            navigationRef.current?.reset({
                                index: 0,
                                routes: [{
                                    name: 'drawernavigation',
                                    params: {
                                        screen: 'BottomNavigation',
                                        params: { screen: 'Home' }
                                    }
                                }]
                            });
                        }
                    }
                }}
            >
                <StackNavigator />
            </NavigationContainer>
        </themeContext.Provider>
    );
};

export default Routes;
