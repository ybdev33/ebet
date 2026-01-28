import React, { useState, useRef, useCallback, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TextInput,
    Modal,
    Platform,
    TouchableOpacity
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
import DateTimePicker from '@react-native-community/datetimepicker';

const { GAMING_DOMAIN, GAMING_API } = Constants.expoConfig?.extra || {};

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
    const [date02, setDate02] = useState(new Date());
    const [showStartPicker, setShowStartPicker] = useState(false);
    const [showEndPicker, setShowEndPicker] = useState(false);

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

            const response = await fetch(`${GAMING_DOMAIN}/api/LoadManagement/GetHistoryTransactionDetails?TransactionCode=${referenceId.replace(/^#/, '')}`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `ebonline ${GAMING_API}`,
                },
            });

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

    // Date pickers
    const onChangeStart = (_event: any, selectedDate?: Date) => {
        setShowStartPicker(Platform.OS === 'ios');
        if (selectedDate) setDate(selectedDate);
    };

    const onChangeEnd = (_event: any, selectedDate?: Date) => {
        setShowEndPicker(Platform.OS === 'ios');
        if (selectedDate) setDate02(selectedDate);
    };

    // Fetch history data for active tab and selected date range
    useFocusEffect(
        useCallback(() => {
            let isActive = true;

            (async () => {
                try {
                    const user = await getSession('userSession');
                    const userId = user.data.userId;
                    const date = new Date().toISOString().split("T")[0];
                    // const startDate = date.toISOString().split('T')[0];
                    // const endDate = date02.toISOString().split('T')[0];

                    // console.log(`${GAMING_DOMAIN}/api/LoadManagement/GetHistoryTransaction?authorId=${userId}&startDate=${startDate}&endDate=${endDate}&type=${tab}`);

                    const response = await fetch(`${GAMING_DOMAIN}/api/LoadManagement/GetHistoryTransaction?authorId=${userId}&date=${date}&type=${tab}`, {
                        method: 'GET',
                        headers: {
                            'Content-Type': 'application/json',
                            Authorization: `ebonline ${GAMING_API}`,
                        },
                    });

                    const result = await response.json();
                    if (response.ok && result.status === 1) {
                        const mappedData = result.data.map((item: any): AccordionItem => {
                            const isPositive = item.totalAmount.startsWith('+');

                            const coin = isPositive ? (
                                <FeatherIcon style={{ position: 'absolute', left: 5, top: 5 }} name="chevrons-up" size={25} color={COLORS.primary} />
                            ) : (
                                <FeatherIcon style={{ position: 'absolute', left: 5, top: 5 }} name="chevrons-down" size={25} color={COLORS.danger} />
                            );

                            return {
                                id: item.loadTransactionId.toString(),
                                coin,
                                amount: item.totalAmount,
                                date: new Date(item.dateCreated).toLocaleString(),
                                referenceId: `#${item.transactionCode}`,
                                transactionDescription: item.transactionDescription,
                            };
                        });

                        if (isActive) setAccordionData(mappedData);
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
            })();

            return () => { isActive = false; };
        }, [tab, date, date02])
    );

    useEffect(() => {
        setActiveSections(accordionData.map((_, index) => index));
    }, [accordionData]);

    return (
        <View style={{ backgroundColor: colors.background, flex: 1 }}>
            <HeaderBar leftIcon="back" title="History" />

            <View style={{ padding: 15 }}>
                {/* Date Range */}
                <View style={{ padding: 10, flexDirection: 'row' }}>
                    <View style={{ flex: 1 }}>
                        <View style={{
                            height: 48,
                            borderWidth: 1,
                            borderColor: colors.borderColor,
                            backgroundColor: colors.card,
                            borderRadius: SIZES.radius,
                            flexDirection: 'row',
                            ...GlobalStyleSheet.shadow,
                        }}>
                            <FeatherIcon style={{ position: 'absolute', left: 12, top: 12 }} name="calendar" size={20} color={COLORS.primary} />

                            <Ripple onPress={() => setShowStartPicker(true)}>
                                <TextInput style={{ ...FONTS.font, color: colors.title, paddingLeft: 45, paddingRight: 6, height: 46 }} value={date.toDateString().slice(4)} editable={false} />
                            </Ripple>

                            <Text style={{ alignSelf: 'center', ...FONTS.font, color: colors.text }}>-</Text>

                            <Ripple onPress={() => setShowEndPicker(true)}>
                                <TextInput style={{ ...FONTS.font, color: colors.title, paddingLeft: 6, height: 46 }} value={date02.toDateString().slice(4)} editable={false} />
                            </Ripple>
                        </View>
                    </View>

                    {/* Date Pickers */}
                    {showStartPicker && <DateTimePicker value={date} mode="date" display="default" onChange={onChangeStart} maximumDate={new Date()} />}
                    {showEndPicker && <DateTimePicker value={date02} mode="date" display="default" onChange={onChangeEnd} maximumDate={new Date()} />}
                </View>

                {/* Tabs */}
                <View style={styles.tabContainer}>
                    <Ripple style={[styles.tab, tab === 'bet' && styles.activeTab]} onPress={() => setTab('bet')}>
                        <Text style={[FONTS.fontSm, styles.tabText, tab === 'bet' && styles.activeTabText]}>Bet</Text>
                    </Ripple>
                    <Ripple style={[styles.tab, tab === 'load' && styles.activeTab]} onPress={() => setTab('load')}>
                        <Text style={[FONTS.fontSm, styles.tabText, tab === 'load' && styles.activeTabText]}>Load</Text>
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
                            <Ripple onPress={() => item.transactionDescription.includes('Bet') && handleHistoryBet(item.referenceId)} style={styles.accordionHeader}>
                                <View style={{ height: 35, width: 35, marginRight: 10, borderRadius: SIZES.radius, backgroundColor: colors.background }}>{item.coin}</View>
                                <View>
                                    <Text style={{ ...FONTS.font, color: colors.title, marginBottom: 5 }}>{item.transactionDescription}</Text>
                                    <Text style={{ ...FONTS.fontXs, color: colors.text }}>{item.date}</Text>
                                </View>
                                <View style={{ alignItems: 'center', justifyContent: 'center', marginLeft: 'auto' }}>
                                    <Text style={{ ...FONTS.font, color: item.amount.startsWith('+') ? COLORS.primary : COLORS.danger, marginBottom: 5 }}>{item.amount}</Text>
                                </View>
                            </Ripple>
                        )}
                        renderContent={(item) => (
                            <View style={[styles.accordionBody, { borderColor: colors.borderColor }]}>
                                <Text style={{ ...FONTS.fontXs, color: COLORS.primary, marginBottom: 5 }}>Reference ID</Text>
                                <Text style={{ ...FONTS.fontXs, color: colors.text }}>{item.referenceId}</Text>
                            </View>
                        )}
                        duration={300}
                        onChange={() => {}}
                    />
                </ScrollView>
            </View>

            {/* Modals */}
            <Modal animationType="fade" transparent visible={modalVisible} onRequestClose={() => setModalVisible(false)}>
                <View style={styles.modalOverlay}>
                    <SuccessModal message={modalMessage} isSuccess={isSuccess} onClose={() => setModalVisible(false)} />
                </View>
            </Modal>

            <ReceiptModal visible={showReceipt} onClose={() => setShowReceipt(false)} drawTime={receiptData.drawTime} betTime={receiptData.betTime} combinations={receiptData.combinations} total={receiptData.total} reference={receiptData.reference} />
        </View>
    );
};

const styles = StyleSheet.create({
    tabContainer: { flexDirection: 'row', margin: 12, borderRadius: SIZES.radius, backgroundColor: COLORS.darkBorder },
    tab: { flex: 1, paddingVertical: 12, alignItems: 'center', borderRadius: SIZES.radius },
    activeTab: { backgroundColor: COLORS.primary },
    tabText: {color: '#555' },
    activeTabText: { color: COLORS.white },
    accordionItem: { borderRadius: SIZES.radius, marginBottom: 10, marginHorizontal: 10, overflow: 'hidden', elevation: 8, shadowColor: 'rgba(0,0,0,.6)' },
    accordionHeader: { padding: 10, flexDirection: 'row', alignItems: 'center' },
    accordionBody: { borderTopWidth: 1, padding: 10, flexDirection: 'row', justifyContent: 'space-between' },
    modalOverlay: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.5)' },
});

export default HistoryLoad;
