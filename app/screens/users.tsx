import React, { useEffect, useRef, useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    Modal,
    Animated,
    Image,
    ImageBackground,
    TouchableOpacity, TextInput, Platform,
} from 'react-native';
import { COLORS, FONTS, ICONS, IMAGES } from '../constants/theme';
import HeaderBar from '../layout/header';
import { GlobalStyleSheet } from '../constants/styleSheet';
import { useTheme } from '@react-navigation/native';
import { getSession } from "../helpers/sessionHelper";
import SuccessModal from "../components/modal/SuccessModal";
import Ripple from "react-native-material-ripple";
import FeatherIcon from "react-native-vector-icons/Feather";
import Constants from "expo-constants";
import CustomButton from "@/app/components/customButton";

const Users: React.FC = () => {
    const { GAMING_DOMAIN } = Constants.expoConfig?.extra || {};
    const { colors } = useTheme();

    const [modalVisible, setModalVisible] = useState(false);
    const [modalMessage, setModalMessage] = useState('');
    const [isSuccess, setIsSuccess] = useState(false);

    const [userData, setUserData] = useState([]);
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 20;

    const totalPages = Math.ceil(userData.length / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const paginatedUsers = userData.slice(startIndex, startIndex + itemsPerPage);

    const scrollIndicator = useRef(new Animated.Value(0)).current;
    const [completeScrollBarWidth, setCompleteScrollBarWidth] = useState(1);
    const [visibleScrollBarWidth, setVisibleScrollBarWidth] = useState(0);

    const scrollIndicatorSize =
        completeScrollBarWidth > visibleScrollBarWidth
            ? (visibleScrollBarWidth * visibleScrollBarWidth) / completeScrollBarWidth
            : visibleScrollBarWidth;

    const difference =
        visibleScrollBarWidth > scrollIndicatorSize
            ? visibleScrollBarWidth - scrollIndicatorSize
            : 1;

    const scrollIndicatorPosition = Animated.multiply(
        scrollIndicator,
        visibleScrollBarWidth / completeScrollBarWidth
    ).interpolate({
        inputRange: [0, difference],
        outputRange: [0, difference],
        extrapolate: 'clamp'
    });
    const [topUpModalVisible, setTopUpModalVisible] = useState(false);
    const [selectedUser, setSelectedUser] = useState(null);

    const [availableBalance, setAvailableBalance] = useState('');
    const [sendAmount, setSendAmount] = useState('');
    const sendInputRef = useRef(null);

    const handleTopUpPress = async () => {
        try {
            const userSession = await getSession('userSession');
            const userId = userSession.data.userId;

            const response = await fetch(
                `${GAMING_DOMAIN}/api/LoadManagement/GetUserLoad?authorId=${userId}`,
                {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                }
            );

            const result = await response.json();

            if (response.ok && result.status === 1) {
                setAvailableBalance(result.data.amount);
            } else {
                throw new Error('Invalid response');
            }
        } catch (error) {
            setModalMessage('Something went wrong. Please try again later.');
            setIsSuccess(false);
            setModalVisible(true);
        }
    };

    const handleSendChange = (text) => {
        const cleanText = text.replace(/[^0-9.]/g, '');

        const numericValue = parseFloat(cleanText);

        const maxBalance = parseFloat(availableBalance);

        if (!isNaN(numericValue)) {
            if (numericValue <= maxBalance) {
                setSendAmount(cleanText);
            } else {
                setSendAmount(maxBalance.toString());
            }
        } else {
            setSendAmount('');
        }
    };

    const handleSendPress = async () => {
        try {
            const userSession = await getSession('userSession');
            const userId = userSession.data.userId;

            let body = JSON.stringify({
                authorId: userId,
                userId: selectedUser?.userId,
                amount: sendAmount
            });

            const response = await fetch(
                `${GAMING_DOMAIN}/api/LoadManagement/CreateLoadUser`,
                {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: body,
                }
            );

            const result = await response.json();

            if (response.ok && result.status === 1) {
                setModalMessage(result.message);
                setIsSuccess(true);
                setModalVisible(true);
                setTopUpModalVisible(false);
                setSelectedUser(null);
            } else {
                setTopUpModalVisible(false);
                setModalMessage(result.message);
                setIsSuccess(false);
                setModalVisible(true);
            }
        } catch (error) {
            setModalMessage('Something went wrong. Please try again later.');
            setIsSuccess(false);
            setModalVisible(true);
        }
    };

    useEffect(() => {
        (async () => {
            try {
                const userSession = await getSession('userSession');
                const userId = userSession.data.userId;

                const response = await fetch(`${GAMING_DOMAIN}/api/ApplicationUsers/GetUserByAuthorId?AuthorId=${userId}`, {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json',
                    }
                });

                const result = await response.json();
                if (response.ok && result.status === 1) {
                    setUserData(result.data);
                } else {
                    throw new Error("Invalid response");
                }
            } catch (error) {
                setModalMessage('Something went wrong. Please try again later.');
                setIsSuccess(false);
                setModalVisible(true);
            }
        })();

        if (topUpModalVisible) {
            setSendAmount('');
            const timeout = setTimeout(() => {
                sendInputRef.current?.focus();
            }, 150);

            return () => clearTimeout(timeout);
        }
    }, [topUpModalVisible]);

    return (
        <View style={[GlobalStyleSheet.container, {
            backgroundColor: colors.background,
            flex: 1,
            padding: 20,
            ...(Platform.OS === 'web' && {
                height: '100vh',
                overflowY: 'auto',
                scrollbarWidth: 'none',
                msOverflowStyle: 'none',
            }),
        }]}>
            <View style={{ ...styles.container, backgroundColor: colors.background }}>
                <HeaderBar title="Users" leftIcon="back" />
                <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    onContentSizeChange={width => setCompleteScrollBarWidth(width)}
                    onLayout={({ nativeEvent: { layout: { width } } }) => setVisibleScrollBarWidth(width)}
                    onScroll={Animated.event(
                        [{ nativeEvent: { contentOffset: { x: scrollIndicator } } }],
                        { useNativeDriver: false }
                    )}
                    scrollEventThrottle={16}
                >
                    <View style={{ marginTop: 20, paddingHorizontal: 15}}>
                        <View style={[styles.tableHeader, { backgroundColor: colors.card }]}>
                            <Text style={[styles.tableItemHead, { color: colors.title }]}>Load</Text>
                            <View style={[styles.iconColumn, {width: 15}]}>
                                <Text style={{ ...FONTS.fontSm, color: colors.title }}></Text>
                            </View>
                            <Text style={[styles.tableItemHead, { color: colors.title }]}>Name</Text>
                            <Text style={[styles.tableItemHead, { color: colors.title }]}>Username</Text>
                            <Text style={[styles.tableItemHead, { color: colors.title }]}>Mobile</Text>
                            <Text style={[styles.tableItemHead, { color: colors.title }]}>Status</Text>
                            <Text style={[styles.tableItemHead, { color: colors.title }]}>Date Registered</Text>
                            <View style={[styles.iconColumn]}>
                                <Text style={{ ...FONTS.fontSm, color: colors.title }}>Action</Text>
                            </View>
                        </View>

                        {paginatedUsers.map((user) => (
                            <View
                                key={user.userId}
                                style={{ flexDirection: 'row', height: 40, alignItems: 'center', width: '100%' }}
                            >
                                <Text style={[styles.tableItem, { color: COLORS.primary }]}>₱ {user.loadAmount}</Text>
                                <View style={[styles.iconColumn, {width: 15}]}>
                                    <Ripple
                                        onPress={() => {
                                            handleTopUpPress();
                                            setSelectedUser(user);
                                            setTopUpModalVisible(true);
                                        }}
                                        style={[
                                            styles.paginationButton,
                                            {
                                                backgroundColor: COLORS.primary},
                                        ]}
                                    >
                                        <Image source={ICONS.trade} style={{ height: 18, width: 18 }} />
                                    </Ripple>
                                </View>
                                <Text style={[styles.tableItem, { color: colors.text }]}>{user.completeName}</Text>
                                <Text style={[styles.tableItem, { color: colors.text }]}>{user.username}</Text>
                                <Text style={[styles.tableItem, { color: colors.text }]}>{user.mobileNumber}</Text>
                                <Text style={[styles.tableItem, { color: colors.text }]}>
                                    {user.accountStatus ? 'Active' : 'Inactive'}
                                </Text>
                                <Text style={[styles.tableItem, { color: colors.text }]}>
                                    {new Date(user.dateRegister).toLocaleDateString()}
                                </Text>

                                <View style={styles.iconColumn}>
                                    <Ripple onPress={() => console.log(`Edit ${user.username}`)}>
                                        <FeatherIcon name="more-vertical" size={18} color={COLORS.primary} />
                                    </Ripple>
                                </View>
                            </View>
                        ))}
                    </View>
                </ScrollView>

                <View style={{ paddingHorizontal: 15 }}>
                    <View style={[styles.scrollBar, { backgroundColor: colors.card }]}>
                        <Animated.View
                            style={{
                                height: 5,
                                left: 3,
                                borderRadius: 8,
                                backgroundColor: COLORS.primary,
                                width: scrollIndicatorSize - 36,
                                transform: [{ translateX: scrollIndicatorPosition }],
                            }}
                        />
                    </View>
                </View>

                <View style={styles.paginationContainer}>
                    <Text style={{ ...FONTS.fontXs, color: colors.text }}>
                        Showing {startIndex + 1} to {Math.min(startIndex + itemsPerPage, userData.length)} of {userData.length} entries
                    </Text>

                    <View style={styles.pagination}>
                        <Ripple
                            disabled={currentPage === 1}
                            onPress={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                            style={[styles.paginationButton, { backgroundColor: colors.card }]}
                        >
                            <FeatherIcon size={14} color={colors.title} name='chevron-left' />
                        </Ripple>

                        {Array.from({ length: totalPages }, (_, i) => (
                            <Ripple
                                key={i}
                                onPress={() => setCurrentPage(i + 1)}
                                style={[
                                    styles.paginationButton,
                                    {
                                        backgroundColor: currentPage === i + 1 ? COLORS.primary : colors.card,
                                    },
                                ]}
                            >
                                <Text style={{
                                    ...FONTS.fontSm,
                                    color: currentPage === i + 1 ? '#fff' : colors.text
                                }}>
                                    {i + 1}
                                </Text>
                            </Ripple>
                        ))}

                        <Ripple
                            disabled={currentPage === totalPages}
                            onPress={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                            style={[styles.paginationButton, { backgroundColor: colors.card }]}
                        >
                            <FeatherIcon size={14} color={colors.title} name='chevron-right' />
                        </Ripple>
                    </View>
                </View>

                <Modal
                    animationType="fade"
                    transparent={true}
                    visible={modalVisible}
                    onRequestClose={() => setModalVisible(false)}
                >
                    <View style={styles.modalOverlay}>
                        <SuccessModal
                            message={modalMessage}
                            isSuccess={isSuccess}
                            onClose={() => setModalVisible(false)}
                        />
                    </View>
                </Modal>
                <Modal
                    animationType="slide"
                    transparent={false}
                    visible={topUpModalVisible}
                    onRequestClose={() => {
                        setTopUpModalVisible(false);
                        setSelectedUser(null);
                    }}
                >
                    <View style={{ ...styles.container, backgroundColor: colors.background }}>
                        <HeaderBar
                            leftIcon="back"
                            title={`Top-Up: ${selectedUser?.completeName ?? ''}`}
                            onPressLeft={() => {
                                setTopUpModalVisible(false);
                                setSelectedUser(null);
                            }}
                        />
                        <ScrollView
                            contentContainerStyle={{ paddingBottom: 100 }}
                            keyboardShouldPersistTaps="handled">
                            <View style={[GlobalStyleSheet.container, { padding: 15 }]}>
                                <View style={{ marginBottom: 20 }}>
                                    <ImageBackground
                                        source={IMAGES.bg1}
                                        style={{
                                            paddingHorizontal: 15,
                                            paddingVertical: 15,
                                            backgroundColor: COLORS.secondary,
                                            borderRadius: 12,
                                            flexDirection: 'row',
                                            alignItems: 'flex-end',
                                            overflow: 'hidden'
                                        }}
                                    >
                                        <View style={{ flex: 1 }}>
                                            <Text style={{ ...FONTS.fontSm, color: COLORS.white, opacity: 0.7, marginTop: 20, marginLeft: 20 }}>Available Balance</Text>
                                            <TextInput
                                                style={{
                                                    ...FONTS.h3,
                                                    color: COLORS.white,
                                                    ...FONTS.fontMedium,
                                                    padding: 0,
                                                    height: 50,
                                                    marginTop: 15,
                                                    marginLeft: 35
                                                }}
                                                value={availableBalance.toString()}
                                                editable={false}
                                            />
                                        </View>
                                    </ImageBackground>

                                    <View style={{ alignItems: 'center', marginVertical: -20, zIndex: 1 }}>
                                        <TouchableOpacity
                                            activeOpacity={1}
                                            style={{
                                                height: 50,
                                                width: 50,
                                                backgroundColor: COLORS.dark,
                                                borderRadius: 50,
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                            }}
                                        >
                                            <Image source={ICONS.trade} style={{ height: 28, width: 28 }} />
                                        </TouchableOpacity>
                                    </View>

                                    <ImageBackground
                                        source={IMAGES.bg1}
                                        style={{
                                            paddingHorizontal: 15,
                                            paddingVertical: 15,
                                            backgroundColor: COLORS.secondary,
                                            borderRadius: 12,
                                            flexDirection: 'row',
                                            alignItems: 'flex-end',
                                            overflow: 'hidden',
                                        }}
                                    >
                                        <View style={{ flex: 1 }}>
                                            <Text style={{ ...FONTS.fontSm, color: COLORS.white, opacity: 0.7, marginTop: 20, marginLeft: 20 }}>Send Amount</Text>
                                            <TextInput
                                                ref={sendInputRef}
                                                style={{
                                                    ...FONTS.h3,
                                                    color: COLORS.white,
                                                    ...FONTS.fontMedium,
                                                    padding: 0,
                                                    height: 50,
                                                    marginTop: 15,
                                                    marginLeft: 35
                                                }}
                                                value={sendAmount}
                                                onChangeText={handleSendChange}
                                                keyboardType="numeric"
                                                inputMode="decimal"
                                            />
                                        </View>
                                    </ImageBackground>
                                </View>

                                <CustomButton
                                    disabled={!sendAmount || parseFloat(sendAmount) <= 0}
                                    onPress={handleSendPress}
                                    title="Send" />

                            </View>
                        </ScrollView>
                    </View>
                </Modal>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    tableHeader: {
        borderRadius: 8,
        flexDirection: 'row',
        height: 40,
        alignItems: 'center',
        width: '100%',
        ...GlobalStyleSheet.shadow,
    },
    tableItem: {
        width: 110,
        ...FONTS.font,
        paddingHorizontal: 15,
        flexBasis: 110,
        flexShrink: 1,
    },
    tableItemHead: {
        width: 110,
        ...FONTS.font,
        paddingHorizontal: 15,
        flexBasis: 110,
        flexShrink: 1,
    },
    iconColumn: {
        width: 50,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 10
    },
    scrollBar: {
        width: '100%',
        height: 10,
        borderRadius: 8,
        justifyContent: 'center',
        ...GlobalStyleSheet.shadow,
    },
    paginationContainer: {
        marginHorizontal: 15,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginVertical: 15,
    },
    pagination: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    paginationButton: {
        height: 28,
        width: 28,
        borderRadius: 4,
        alignItems: 'center',
        justifyContent: 'center',
        marginHorizontal: 2,
    },
    modalOverlay: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
    },
});

export default Users;