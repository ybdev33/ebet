import React from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { BottomTabBarProps } from "@react-navigation/bottom-tabs";
import Home from "../screens/home";
import CustomTabBar from "./CustomTabBar";
import BetPicker from "../screens/betPicker";
import HistoryLoad from '../components/history/historyLoad';
import Profile from "../screens/Profile";
import Users from '../screens/users';

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
            <Tab.Screen name="Top-Up" component={Users} />
            <Tab.Screen name="Bet" component={BetPicker} />
            <Tab.Screen name="History" component={HistoryLoad} />
            <Tab.Screen name="Profile" component={Profile} />
        </Tab.Navigator>
    );
};

export default BottomNavigation;
