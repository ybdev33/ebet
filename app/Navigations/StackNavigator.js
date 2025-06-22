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
                <Stack.Screen name="signup" component={SignUp}/>
                <Stack.Screen name="emailverify" component={EmailVerify}/>
                <Stack.Screen name="changepassword" component={ChangePassword}/>
                <Stack.Screen name="drawernavigation" component={DrawerNavigation}/>
                <Stack.Screen name="account" component={Account}/>
                <Stack.Screen name="verification" component={Verification}/>
                <Stack.Screen name="knowyourcrypto" component={KnowYourCrypto}/>
                <Stack.Screen name="settings" component={Settings}/>
                <Stack.Screen name="history" component={History}/>
                <Stack.Screen name="helpdesk" component={HelpDesk}/>
                <Stack.Screen name="messages" component={Messages}/>
                <Stack.Screen name="paymentMethod" component={PaymentMethod}/>
                <Stack.Screen name="referral" component={Referral}/>
                <Stack.Screen name="notifications" component={Notifications}/>
                <Stack.Screen name="profitloss" component={ProfitLoss}/>
                <Stack.Screen name="search" component={Search}/>
                <Stack.Screen name="Components" component={Components}/>
                <Stack.Screen name="Accordion" component={AccordionScreen}/>
                <Stack.Screen name="ActionSheet" component={ActionSheet}/>
                <Stack.Screen name="ActionModals" component={ActionModals}/>
                <Stack.Screen name="Buttons" component={Buttons}/>
                <Stack.Screen name="Charts" component={Charts}/>
                <Stack.Screen name="Chips" component={Chips}/>
                <Stack.Screen name="CollapseElements" component={CollapseElements}/>
                <Stack.Screen name="DividerElements" component={DividerElements}/>
                <Stack.Screen name="FileUploads" component={FileUploads}/>
                <Stack.Screen name="Headers" component={Headers}/>
                <Stack.Screen name="Footers" component={Footers}/>
                <Stack.Screen name="TabStyle1" component={TabStyle1}/>
                <Stack.Screen name="TabStyle2" component={TabStyle2}/>
                <Stack.Screen name="TabStyle3" component={TabStyle3}/>
                <Stack.Screen name="TabStyle4" component={TabStyle4}/>
                <Stack.Screen name="Inputs" component={Inputs}/>
                <Stack.Screen name="lists" component={ListScreen}/>
                <Stack.Screen name="Paginations" component={Paginations}/>
                <Stack.Screen name="Pricings" component={Pricings}/>
                <Stack.Screen name="Snackbars" component={Snackbars}/>
                <Stack.Screen name="Socials" component={Socials}/>
                <Stack.Screen name="Swipeable" component={SwipeableScreen}/>
                <Stack.Screen name="Tabs" component={Tabs}/>
                <Stack.Screen name="Tables" component={Tables}/>
                <Stack.Screen name="Toggles" component={Toggles}/>
                <Stack.Screen name="betPicker" component={BetPicker}/>
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
