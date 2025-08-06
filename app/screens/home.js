import React, {useCallback, useState} from 'react';
import {
    View,
    StyleSheet,
    ScrollView,
    Platform, Modal, Text, Image,
} from 'react-native';
import {useFocusEffect, useTheme} from '@react-navigation/native';
import * as Animatable from 'react-native-animatable';
import BalanceChart from '../components/totalBalanceChart';
import BalanceWidgets from '../components/balanceWidgets';
import { GlobalStyleSheet } from '../constants/styleSheet';
import SuccessModal from "../components/modal/SuccessModal";
import {getSession} from "../helpers/sessionHelper";
import Constants from 'expo-constants';
import {COLORS, FONTS, IMAGES} from "@/app/constants/theme";
import DrawResult from '../components/DrawResult';

const { GAMING_DOMAIN } = Constants.expoConfig?.extra || {};

const Home = () => {

    const {colors} = useTheme();

    const [amount, setAmount] = useState("Loading...");
    const [dashData, setDashData] = useState([]);

    const [modalVisible, setModalVisible] = useState(false);
    const [modalMessage, setModalMessage] = useState('');
    const [isSuccess, setIsSuccess] = useState(false);

    useFocusEffect(
        useCallback(() => {
            let isActive = true;

            const fetchData = async () => {
                try {
                    const user = await getSession('userSession');
                    const userId = user.data.userId;

                    const fetchUserLoad = async () => {
                        try {
                            const response = await fetch(`${GAMING_DOMAIN}/api/LoadManagement/GetUserLoad?authorId=${userId}`, {
                                method: 'GET',
                                headers: {
                                    'Content-Type': 'application/json',
                                }
                            });

                            const result = await response.json();

                            if (response.ok && isActive) {
                                const fetchedAmount = result.data?.amount;
                                setAmount(fetchedAmount);
                            }
                        } catch (error) {
                            setModalMessage('Something went wrong. Please try again later.');
                            setIsSuccess(false);
                            setModalVisible(true);
                        }
                    };

                    const fetchTotalDash = async () => {
                        try {
                            const response = await fetch(`${GAMING_DOMAIN}/api/Common/GetDashBoardDetails?authorId=${userId}&date=08-06-2025`, {
                                method: 'GET',
                                headers: {
                                    'Content-Type': 'application/json',
                                }
                            });

                            const result = await response.json();

                            if (response.ok && isActive) {
                                setDashData(result.data);
                            }
                        } catch (error) {
                            setModalMessage('Failed to fetch dashboard data. Please try again.');
                            setIsSuccess(false);
                            setModalVisible(true);
                        }
                    };

                    fetchUserLoad();
                    fetchTotalDash();

                } catch (error) {
                    setModalMessage('Failed to load user session.');
                    setIsSuccess(false);
                    setModalVisible(true);
                }
            };

            fetchData();

            return () => {
                isActive = false;
            };
        }, [])
    );

    return(
        <View style={[{backgroundColor:colors.background,flex:1},Platform.OS === 'web' && GlobalStyleSheet.container,{padding:0}]}>
            <ScrollView showsHorizontalScrollIndicator={false}>
                <BalanceChart amount={amount}/>
                <Animatable.View
                    animation="fadeInRight" 
                    duration={500}
                    delay={1000}
                >
                    <BalanceWidgets dashData={dashData}/>
                </Animatable.View>
                <Animatable.View
                    animation="fadeIn"
                    duration={500}
                    delay={1500}
                >
                    <DrawResult dashData={dashData} />
                </Animatable.View>
            </ScrollView>

            <Modal
                animationType="fade"
                transparent={true}
                visible={modalVisible}
                onRequestClose={() => setModalVisible(false)}
            >
                <View style={{
                    flex: 1,
                    justifyContent: 'center',
                    alignItems: 'center',
                    backgroundColor: 'rgba(0, 0, 0, 0.5)',
                }}>
                    <SuccessModal
                        message={modalMessage}
                        isSuccess={isSuccess}
                        onClose={() => setModalVisible(false)}
                    />
                </View>
            </Modal>
        </View>
    )
}

export default Home;