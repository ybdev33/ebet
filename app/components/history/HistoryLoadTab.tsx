import React, { useState, useRef, useCallback, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TextInput,
    Modal,
    Platform,
    TouchableOpacity,
} from 'react-native';
import FeatherIcon from 'react-native-vector-icons/Feather';
import { FONTS, SIZES, COLORS, ICONS } from '../../constants/theme';
import Ripple from 'react-native-material-ripple';
import Accordion from 'react-native-collapsible/Accordion';
import RBSheet from 'react-native-raw-bottom-sheet';
import { useFocusEffect, useTheme } from '@react-navigation/native';
import { GlobalStyleSheet } from '../../constants/styleSheet';
import HeaderBar from '@/app/layout/header';
import { getSession } from '@/app/helpers/sessionHelper';
import Constants from 'expo-constants';
import SuccessModal from '@/app/components/modal/SuccessModal';
import ReceiptModal from '@/app/components/modal/ReceiptModal';

import ReactDatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';

const { GAMING_DOMAIN, GAMING_DEV, GAMING_API } = Constants.expoConfig?.extra || {};
const detectedPort = typeof window !== 'undefined' ? window.location.port : '';
const API_DOMAIN =
    (detectedPort === '8081' || detectedPort === '6049') && GAMING_DEV
        ? GAMING_DEV
        : GAMING_DOMAIN;

interface AccordionItem {
    id: string;
    coin: any;
    amount: string;
    date: string;
    referenceId: string;
    transactionDescription: string;
}

const HistoryLoad: React.FC = () => {
    const { colors } = useTheme();
    const refRBSheet = useRef<RBSheet>(null);

    const [tab, setTab] = useState<'bet' | 'load'>('bet');
    const [accordionData, setAccordionData] = useState<AccordionItem[]>([]);
    const [activeSections, setActiveSections] = useState<number[]>([]);

    const [date, setDate] = useState(new Date());
    const [modalVisible, setModalVisible] = useState(false);
    const [modalMessage, setModalMessage] = useState('');
    const [isSuccess, setIsSuccess] = useState(false);

    const [showReceipt, setShowReceipt] = useState(false);
    const [receiptData, setReceiptData] = useState({
        drawTime: '',
        betTime: '',
        combinations: [],
        total: 0,
        reference: '',
    });

    // Handle Bet Details modal
    const handleHistoryBet = async (referenceId: string) => {
        try {
            const user = await getSession('userSession');
            const userId = user.data.userId;

            const response = await fetch(
                `${API_DOMAIN}/api/LoadManagement/GetHistoryTransactionDetails?TransactionCode=${referenceId.replace(/^#/, '')}`,
                {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json',
                        Authorization: `ebonline ${GAMING_API}`,
                    },
                }
            );

            const result = await response.json();
            if (response.ok && result.status === 1) {
                const combinations = result.data.bets.map((bet: any) => {
                    const prefix = bet.isRambol ? 'R' : 'T';
                    return {
                        label: `${prefix} ${bet.winCombination ?? '---'}`,
                        amount: bet.amount,
                        draw: bet.drawCategory,
                        win: bet.winningAmount ?? 0,
                    };
                });

                setReceiptData({
                    drawTime: result.data.drawTime,
                    betTime: result.data.dateTimeServer,
                    combinations,
                    total: result.data.totalAmount,
                    reference: result.data.transCode,
                });

                setShowReceipt(true);
            } else {
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

    const fetchHistory = useCallback(async () => {
        try {
            const user = await getSession('userSession');
            const userId = user.data.userId;
            const dateStr = date.getFullYear() + '-' +
                            String(date.getMonth() + 1).padStart(2, '0') + '-' +
                            String(date.getDate()).padStart(2, '0');

            const response = await fetch(
                `${API_DOMAIN}/api/LoadManagement/GetHistoryTransaction?authorId=${userId}&date=${dateStr}&type=${tab}`,
                {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json',
                        Authorization: `ebonline ${GAMING_API}`,
                    },
                }
            );

            const result = await response.json();
            if (response.ok && result.status === 1) {
                const mappedData = result.data.map((item: any): AccordionItem => {
                    const isPositive = item.totalAmount.startsWith('+');
                    const coin = isPositive ? (
                        <FeatherIcon
                            style={{ position: 'absolute', left: 5, top: 5 }}
                            name="chevrons-up"
                            size={25}
                            color={COLORS.primary}
                        />
                    ) : (
                        <FeatherIcon
                            style={{ position: 'absolute', left: 5, top: 5 }}
                            name="chevrons-down"
                            size={25}
                            color={COLORS.danger}
                        />
                    );

                    return {
                        id: item.loadTransactionId.toString(),
                        coin,
                        amount: item.totalAmount,
                        date: new Date(item.dateCreated).toLocaleString(),
                        referenceId: `#${item.transactionCode}`,
                        transactionDescription: item.transactionDescription,
                        completeName: item.completeName,
                        loadBalance: item.loadBalance,
                    };
                });

                setAccordionData(mappedData);
            } else {
                setModalMessage(result.message);
                setIsSuccess(false);
                setModalVisible(true);
            }
        } catch (error) {
            setModalMessage('Something went wrong. Please try again later.');
            setIsSuccess(false);
            setModalVisible(true);
        }
    }, [date, tab]);

    // Fetch history data
    useFocusEffect(
        useCallback(() => {
            let isActive = true;
            if (isActive) fetchHistory();
            return () => {
                isActive = false;
            };
        }, [fetchHistory])
    );

    useEffect(() => {
        setActiveSections(accordionData.map((_, index) => index));
    }, [accordionData]);

    return (
        <View style={{ backgroundColor: colors.background, flex: 1 }}>
            <HeaderBar leftIcon="back" title="History" />

            <View style={{ padding: 15 }}>
                <View style={{ padding: 10, flexDirection: 'row' }}>
                    <View style={{ flex: 1 }}>
                        <View
                            style={{
                                height: 48,
                                borderWidth: 1,
                                borderColor: colors.borderColor,
                                backgroundColor: colors.card,
                                borderRadius: SIZES.radius,
                                flexDirection: 'row',
                                ...GlobalStyleSheet.shadow,
                            }}
                        >
                            <FeatherIcon
                                style={{ position: 'absolute', left: 12, top: 12 }}
                                name="calendar"
                                size={20}
                                color={COLORS.primary}
                            />

                            <View style={styles.datePickerWrapper}>
                                <View
                                    style={{
                                        height: 48,
                                        borderWidth: 1,
                                        borderColor: colors.borderColor,
                                        backgroundColor: colors.card,
                                        borderRadius: SIZES.radius,
                                        flexDirection: 'row',
                                        ...GlobalStyleSheet.shadow,
                                    }}
                                >
                                    <FeatherIcon
                                        style={{ position: 'absolute', left: 12, top: 12 }}
                                        name="calendar"
                                        size={20}
                                        color={COLORS.primary}
                                    />

                                    {Platform.OS === 'web' ? (
                                        <ReactDatePicker
                                            selected={date}
                                            onChange={(d) => {
                                                setDate(d);
                                                fetchHistory();
                                            }}
                                            portalId="root-portal" // This is crucial for Web
                                            calendarClassName="custom-calendar-z" // Optional class hook
                                            dateFormat="MMMM d, yyyy"
                                            customInput={
                                                <TextInput
                                                    style={{
                                                        ...FONTS.font,
                                                        color: colors.title,
                                                        paddingLeft: 45,
                                                        paddingRight: 6,
                                                        height: 46,
                                                    }}
                                                    value={date.toDateString().slice(4)}
                                                    editable={false}
                                                />
                                            }
                                        />
                                    ) : (
                                        <Ripple onPress={() => {}}>
                                            <TextInput
                                                style={{
                                                    ...FONTS.font,
                                                    color: colors.title,
                                                    paddingLeft: 45,
                                                    paddingRight: 6,
                                                    height: 46,
                                                }}
                                                value={date.toDateString().slice(4)}
                                                editable={false}
                                            />
                                        </Ripple>
                                    )}
                                </View>
                            </View>
                        </View>
                    </View>
                </View>

                <View style={styles.tabContainer}>
                    <Ripple
                        style={[styles.tab, tab === 'bet' && styles.activeTab]}
                        onPress={() => setTab('bet')}
                    >
                        <Text
                            style={[
                                FONTS.fontSm,
                                styles.tabText,
                                tab === 'bet' && styles.activeTabText,
                            ]}
                        >
                            Bet
                        </Text>
                    </Ripple>
                    <Ripple
                        style={[styles.tab, tab === 'load' && styles.activeTab]}
                        onPress={() => setTab('load')}
                    >
                        <Text
                            style={[
                                FONTS.fontSm,
                                styles.tabText,
                                tab === 'load' && styles.activeTabText,
                            ]}
                        >
                            Load
                        </Text>
                    </Ripple>
                </View>

                {/* History Accordion */}
                <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 100 }}>
                    <Accordion
                        containerStyle={{ paddingTop: 15 }}
                        sectionContainerStyle={[styles.accordionItem, { backgroundColor: colors.card }]}
                        activeSections={activeSections}
                        sections={accordionData}
                        touchableComponent={View}
                        expandMultiple={true}
                        renderHeader={(item) => (
                            <Ripple
                                onPress={() =>
                                    item.completeName.includes('Bet') && handleHistoryBet(item.referenceId)
                                }
                                style={styles.accordionHeader}
                            >
                                <View
                                    style={{
                                        height: 35,
                                        width: 35,
                                        marginRight: 10,
                                        borderRadius: SIZES.radius,
                                        backgroundColor: colors.background,
                                    }}
                                >
                                    {item.coin}
                                </View>
                                <View>
                                    <Text style={{ ...FONTS.font, color: colors.title, marginBottom: 5 }}>
                                        {item.completeName}
                                    </Text>
                                    <Text style={{ ...FONTS.fontXs, color: colors.text }}>{item.date}</Text>
                                </View>
                                <View
                                    style={{ alignItems: 'end', justifyContent: 'end', marginLeft: 'auto' }}
                                >
                                    <Text
                                        style={{
                                            ...FONTS.font,
                                            color: item.amount.startsWith('+') ? COLORS.primary : COLORS.danger,
                                            marginBottom: 5,
                                        }}
                                    >
                                        {item.amount}
                                    </Text>
                                    <Text style={{ ...FONTS.font, color: COLORS.primary }}>{item.loadBalance}</Text>
                                </View>
                            </Ripple>
                        )}
                        renderContent={(item) => (
                            <View style={[styles.accordionBody, { borderColor: colors.borderColor }]}>
                                <Text style={{ ...FONTS.fontXs, color: COLORS.primary, marginBottom: 5 }}>
                                    Reference ID
                                </Text>
                                <Text style={{ ...FONTS.fontXs, color: colors.text }}>{item.referenceId}</Text>
                            </View>
                        )}
                        duration={300}
                        onChange={() => {}}
                    />
                </ScrollView>
            </View>

            <Modal animationType="fade" transparent visible={modalVisible} onRequestClose={() => setModalVisible(false)}>
                <View style={styles.modalOverlay}>
                    <SuccessModal message={modalMessage} isSuccess={isSuccess} onClose={() => setModalVisible(false)} />
                </View>
            </Modal>

            <ReceiptModal
                visible={showReceipt}
                onClose={() => setShowReceipt(false)}
                drawTime={receiptData.drawTime}
                betTime={receiptData.betTime}
                combinations={receiptData.combinations}
                total={receiptData.total}
                reference={receiptData.reference}
            />
        </View>
    );
};

const styles = StyleSheet.create({
    tabContainer: { flexDirection: 'row', margin: 12, borderRadius: SIZES.radius, backgroundColor: COLORS.darkBorder },
    tab: { flex: 1, paddingVertical: 12, alignItems: 'center', borderRadius: SIZES.radius },
    activeTab: { backgroundColor: COLORS.primary },
    tabText: { color: '#555' },
    activeTabText: { color: COLORS.white },
    accordionItem: { borderRadius: SIZES.radius, marginBottom: 10, marginHorizontal: 10, overflow: 'hidden', elevation: 8, shadowColor: 'rgba(0,0,0,.6)' },
    accordionHeader: { padding: 10, flexDirection: 'row', alignItems: 'center' },
    accordionBody: { borderTopWidth: 1, padding: 10, flexDirection: 'row', justifyContent: 'space-between' },
    modalOverlay: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.5)' },
    datePickerWrapper: {
        flex: 1,
        ...Platform.select({
            web: {
                zIndex: 9999,
                position: 'relative',
            },
        }),
    },
});

export default HistoryLoad;