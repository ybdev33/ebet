import React, { useState, useEffect } from "react";
import { createStackNavigator, CardStyleInterpolators } from '@react-navigation/stack';
import { StatusBar } from "react-native";
import { useTheme } from "@react-navigation/native";

import SignIn from '../screens/Auth/signin';
import SignUp from '../screens/Auth/signup';
import EmailVerify from '../screens/Auth/emailverify';
import DrawerNavigation from "./DrawerNavigation";
import Account from '../screens/Account';
import History from '../screens/history';
import Referral from '../screens/referral';
import BetPicker from "../screens/betPicker";
import Users from '../screens/users';
import PrinterScreen from '../screens/printerScreen';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getSession } from '../helpers/sessionHelper';

const Stack = createStackNavigator();

const StackNavigator = () => {
    const { colors, dark } = useTheme();
    const [initialRoute, setInitialRoute] = useState(null);

    useEffect(() => {
        const checkUserSession = async () => {
            const session = await getSession('userSession');
            if (session) {
                const lastRoute = await AsyncStorage.getItem('lastRoute');
                setInitialRoute(lastRoute || 'drawernavigation');
            } else {
                setInitialRoute('signin');
            }
        };
        checkUserSession();
    }, []);

    if (!initialRoute) return null; // optional: show splash/loading

    const handleStateChange = async (state: any) => {
        if (!state) return;
        const currentRoute = state.routes[state.index]?.name;
        if (currentRoute) {
            await AsyncStorage.setItem('lastRoute', currentRoute);
        }
    };

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
                <Stack.Screen name="signin" component={SignIn}/>
                <Stack.Screen name="emailverify" component={EmailVerify}/>
                <Stack.Screen name="register" component={SignUp}/>
                <Stack.Screen name="drawernavigation" component={DrawerNavigation}/>
                <Stack.Screen name="account" component={Account}/>
                <Stack.Screen name="history" component={History}/>
                <Stack.Screen name="referral" component={Referral}/>
                <Stack.Screen name="betPicker" component={BetPicker}/>
                <Stack.Screen name="users" component={Users}/>
                <Stack.Screen name="printerScreen" component={PrinterScreen}/>
            </Stack.Navigator>
        </>
    );
};

export default StackNavigator;
