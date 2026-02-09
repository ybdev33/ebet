import React, {useEffect, useState} from 'react';
import {
    View,
    Text,
    StyleSheet,
    Image,
    ScrollView,
    TouchableOpacity,
    TextInput,
    ImageBackground, Modal,
} from 'react-native';
import { FONTS, SIZES, COLORS, ICONS, IMAGES } from '../constants/theme';
import HeaderBar from '../layout/header';
import { GlobalStyleSheet } from '../constants/styleSheet';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '@react-navigation/native';
import {getSession} from "../helpers/sessionHelper";
import SuccessModal from "../components/modal/SuccessModal";
import * as Clipboard from 'expo-clipboard';
import Constants from "expo-constants";

const Referral: React.FC = () => {
    const {
        GAMING_DOMAIN,
        GAMING_DEV,
        GAMING_API,
    } = Constants.expoConfig?.extra || {};

    const detectedPort = typeof window !== 'undefined' ? window.location.port : '';

    const API_DOMAIN =
        (detectedPort === '8081' || detectedPort === '6049') && GAMING_DEV
            ? GAMING_DEV
            : GAMING_DOMAIN;

    const { colors } = useTheme();

    const [modalVisible, setModalVisible] = useState(false);
    const [modalMessage, setModalMessage] = useState('');
    const [isSuccess, setIsSuccess] = useState(false);

    const [referralData, setReferralData] = useState([]);

    useEffect(() => {
        (async () => {
            try {
                const userSession = await getSession('userSession');
                const userId = userSession.data.userId;
                const positionId = userSession.data.positionId;

                const response = await fetch(`${API_DOMAIN}/api/ApplicationUsers/GetReferralLink?AuthorId=${userId}&PositionId=${positionId}`, {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json',
                        Authorization: `ebonline ${GAMING_API}`,
                    },
                });

                const result = await response.json();

                if (response.ok) {
                    setReferralData(result.data);
                }
            } catch (error) {
                setModalMessage('Something went wrong. Please try again later.');
                setIsSuccess(false);
                setModalVisible(true);
            }
        })();
    }, []);

    // @ts-ignore
    return (
        <View style={{ ...styles.container, backgroundColor: colors.background }}>
            <HeaderBar title="Referral" leftIcon="back" />
            <ScrollView showsHorizontalScrollIndicator={false}>
                <View style={[GlobalStyleSheet.container, { padding: 0, paddingBottom: 30, paddingTop: 20 }]}>
                    <ImageBackground
                        source={IMAGES.bg1}
                        style={[
                            {
                                borderRadius: SIZES.radius_lg,
                                paddingHorizontal: 18,
                                paddingVertical: 25,
                                marginHorizontal: 15,
                                borderWidth: 1,
                                borderColor: colors.border,
                                overflow: 'hidden',
                                marginBottom: 20,
                            },
                        ]}
                    >
                        <Text
                            style={{
                                ...FONTS.font,
                                ...FONTS.fontMedium,
                                color: COLORS.white,
                                marginBottom: 30,
                            }}
                        >
                            Share your referral link for member registration
                        </Text>

                        <View>
                            {referralData.map((item, index) => (
                                <View key={index}>
                                    <Text style={{ ...FONTS.fontXs, color: COLORS.primary, marginBottom: 6 }}>
                                        {item.code.charAt(0).toUpperCase() + item.code.slice(1)}
                                    </Text>
                                    <LinearGradient
                                        start={{ x: 0, y: 0 }}
                                        end={{ x: 1, y: 0 }}
                                        colors={[
                                            'rgba(255,255,255,.05)',
                                            'rgba(255,255,255,.1)',
                                            'rgba(255,255,255,.05)',
                                        ]}
                                        style={{ borderColor: COLORS.border, ...GlobalStyleSheet.formControl }}
                                    >
                                        <TextInput
                                            style={{ ...GlobalStyleSheet.Input, color: COLORS.white }}
                                            value={item.link}
                                        />
                                        <View
                                            style={{
                                                flexDirection: 'row',
                                                position: 'absolute',
                                                right: 18,
                                                top: 12,
                                            }}
                                        >
                                            <TouchableOpacity
                                                onPress={() => {
                                                    Clipboard.setString(item.link);
                                                }}>
                                                <Image
                                                    style={{
                                                        height: 20,
                                                        width: 20,
                                                        resizeMode: 'contain',
                                                        tintColor: COLORS.primary,
                                                    }}
                                                    source={ICONS.copy}
                                                />
                                            </TouchableOpacity>
                                        </View>
                                    </LinearGradient>
                                </View>
                            ))}
                        </View>

                    </ImageBackground>

                </View>
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
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    socialIcon: {
        height: 35,
        width: 35,
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: 8,
        marginHorizontal: 4,
    },
});

export default Referral;
