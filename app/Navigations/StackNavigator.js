import React from "react";
import {createStackNavigator, CardStyleInterpolators} from '@react-navigation/stack';
import {StatusBar, StyleSheet, Platform, View} from "react-native";
import SignIn from '../screens/Auth/signin';
import SignUp from '../screens/Auth/signup';
import EmailVerify from '../screens/Auth/emailverify';
import ChangePassword from '../screens/Auth/changepassword';
import DrawerNavigation from "./DrawerNavigation";
import Verification from '../screens/verification';
import KnowYourCrypto from '../screens/knowYourCrypto';
import Settings from '../screens/settings';
import History from '../screens/history';
import HelpDesk from '../screens/helpdesk';
import Messages from '../screens/messages';
import PaymentMethod from '../screens/paymentMethod';
import Referral from '../screens/referral';
import Notifications from '../screens/notifications';
import ProfitLoss from '../screens/profitloss';
import Search from '../screens/search';
import Components from "../screens/Components/Components";
import AccordionScreen from "../screens/Components/Accordion";
import ActionSheet from "../screens/Components/ActionSheet";
import ActionModals from "../screens/Components/ActionModals";
import Buttons from "../screens/Components/Buttons";
import Charts from "../screens/Components/Charts";
import Chips from "../screens/Components/Chips";
import CollapseElements from "../screens/Components/CollapseElements";
import DividerElements from "../screens/Components/DividerElements";
import FileUploads from "../screens/Components/FileUploads";
import Headers from "../screens/Components/Headers";
import Footers from "../screens/Components/Footers";
import TabStyle1 from "../components/Footers/FooterStyle1";
import TabStyle2 from "../components/Footers/FooterStyle2";
import TabStyle3 from "../components/Footers/FooterStyle3";
import TabStyle4 from "../components/Footers/FooterStyle4";
import Inputs from "../screens/Components/Inputs";
import ListScreen from "../screens/Components/Lists";
import Paginations from "../screens/Components/Paginations";
import Pricings from "../screens/Components/Pricings";
import Snackbars from "../screens/Components/Snackbars";
import Socials from "../screens/Components/Socials";
import SwipeableScreen from "../screens/Components/Swipeable";
import Tabs from "../screens/Components/Tabs";
import Tables from "../screens/Components/Tables";
import Toggles from "../screens/Components/Toggles";
import {useTheme} from "@react-navigation/native";
import BetPicker from "../screens/betPicker";
import Account from '../screens/Account';
import Users from '../screens/users';

const MyStatusBar = ({...props}) => (
    <View style={[styles.statusBar]}>
        {Platform.OS === 'android' || Platform.OS === 'web' &&
            <StatusBar translucent {...props} />
        }
    </View>
);

const Stack = createStackNavigator();

const StackNavigator = () => {

    const {colors} = useTheme();
    const theme = useTheme();

    return (
        <View style={[styles.container, {backgroundColor: colors.background, flex: 1}]}>
            <MyStatusBar barStyle={theme.dark ? "light-content" : "dark-content"}/>
            <Stack.Navigator
                initialRouteName="signin"
                screenOptions={{
                    headerShown: false,
                    cardStyle: {backgroundColor: "transparent", flex: 1},
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
            </Stack.Navigator>
        </View>
    );
};

const STATUSBAR_HEIGHT = Platform.OS === 'ios' ? 0 : StatusBar.currentHeight;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        paddingTop: STATUSBAR_HEIGHT,
    },
    statusBar: {
        height: 0,
    },
});
export default StackNavigator;
