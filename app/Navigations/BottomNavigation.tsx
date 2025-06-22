import React from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { BottomTabBarProps } from "@react-navigation/bottom-tabs";
import Home from "../screens/home";
import WalletScreen from "../screens/wallet";
import CustomTabBar from "./CustomTabBar";
import BetPicker from "../screens/betPicker";
import Markets from "../screens/markets";
import Profile from "../screens/Profile";

const Tab = createBottomTabNavigator();

const BottomNavigation: React.FC = () => {
    return (
        <Tab.Navigator
            initialRouteName="Home"
            tabBar={(props: BottomTabBarProps) => <CustomTabBar {...props} />}
            screenOptions={{
                headerShown: false,
            }}
        >
            <Tab.Screen name="Home" component={Home} />
            <Tab.Screen name="Wallet" component={WalletScreen} />
            <Tab.Screen name="Bet" component={BetPicker} />
            <Tab.Screen name="Market" component={Markets} />
            <Tab.Screen name="Profile" component={Profile} />
        </Tab.Navigator>
    );
};

export default BottomNavigation;
