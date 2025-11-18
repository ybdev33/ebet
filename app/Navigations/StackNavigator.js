import React from "react";
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
import BluetoothPrinterScreen from '../screens/BluetoothPrinterScreen';

const Stack = createStackNavigator();

const StackNavigator = () => {
    const { colors, dark } = useTheme();

    return (
        <>
            <StatusBar
                translucent
                backgroundColor="transparent"
                barStyle={dark ? "light-content" : "dark-content"}
            />
            <Stack.Navigator
                initialRouteName="signin"
                screenOptions={{
                    headerShown: false,
                    cardStyle: { backgroundColor: colors.background },
                    cardStyleInterpolator: CardStyleInterpolators.forHorizontalIOS,
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
                <Stack.Screen name="bluetoothPrinterScreen" component={BluetoothPrinterScreen}/>
            </Stack.Navigator>
        </>
    );
};

export default StackNavigator;
