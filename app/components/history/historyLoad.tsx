import React, {useState, useRef, useCallback, useEffect} from 'react';
import {
    View,
    Text,
    StyleSheet,
    Image,
    ScrollView,
    TextInput,
    TextStyle,
    ViewStyle,
    ImageStyle, Modal,
} from 'react-native';
import FeatherIcon from 'react-native-vector-icons/Feather';
import { FONTS, SIZES, COLORS, IMAGES, ICONS } from '../../constants/theme';
import Ripple from 'react-native-material-ripple';
import Accordion from 'react-native-collapsible/Accordion';
import RBSheet from 'react-native-raw-bottom-sheet';
// import DatePicker from 'react-native-date-picker';
import {useFocusEffect, useTheme} from '@react-navigation/native';
import { GlobalStyleSheet } from '../../constants/styleSheet';
import HeaderBar from '@/app/layout/header';
import {getSession} from "@/app/helpers/sessionHelper";
import Constants from 'expo-constants';
import SuccessModal from "@/app/components/modal/SuccessModal";
import ReceiptModal from "@/app/components/modal/ReceiptModal";

const { GAMING_DOMAIN } = Constants.expoConfig?.extra || {};

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
    const [activeSections, setActiveSections] = useState<number[]>([]);
    const [multipleSelect] = useState<boolean>(false);

    const date1 = new Date();
    const formattedDate = date1.toDateString();
    const date2 = new Date();
    const formattedDate02 = date2.toDateString();

    const [date, setDate] = useState<string>(formattedDate.slice(4));
    const [open, setOpen] = useState<boolean>(false);

    const [date02, setDate02] = useState<string>(formattedDate02.slice(4));
    const [open02, setOpen02] = useState<boolean>(false);

    const [modalVisible, setModalVisible] = useState(false);
    const [modalMessage, setModalMessage] = useState('');
    const [isSuccess, setIsSuccess] = useState(false);

    const [accordionData, setAccordionData] = useState<AccordionItem[]>([]);

    const [showReceipt, setShowReceipt] = useState(false);
    const [receiptData, setReceiptData] = useState({
        drawTime: '',
        betTime: '',
        combinations: [],
        total: 0,
        reference: '',
    });

    const handleHistoryBet = async (referenceId: string) => {
        try {
            const user = await getSession('userSession');
            const userId = user.data.userId;

            const response = await fetch(`${GAMING_DOMAIN}/api/LoadManagement/GetHistoryTransactionDetails?TransactionCode=${referenceId.replace(/^#/, '')}`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    // Authorization: 'Settings a2luZ3MzOiF0ZXJ5U3dldGk=',
                },
            });

            const result = await response.json();
            if (response.ok && result.status === 1) {
                const combinations = result.data.bets.map((bet: any) => {
                    const prefix = bet.isRambol ? 'R' : 'T';
                    const label = `${prefix} ${bet.winCombination ?? '---'}`;
                    return {
                        label,
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

    useFocusEffect(
        useCallback(() => {
            let isActive = true;

            (async () => {
                try {
                    const user = await getSession('userSession');
                    const userId = user.data.userId;
                    const date = new Date().toISOString().split("T")[0];

                    const response = await fetch(`${GAMING_DOMAIN}/api/LoadManagement/GetHistoryTransaction?authorId=${userId}&date=${date}`, {
                        method: 'GET',
                        headers: {
                            'Content-Type': 'application/json',
                            // Authorization: 'Settings a2luZ3MzOiF0ZXJ5U3dldGk=',
                        }
                    });

                    const result = await response.json();

                    if (response.ok && result.status === 1) {
                        console.log(result);
                        const mappedData = result.data.map((item: any, index: number): AccordionItem => {
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
            })();

            return () => {
                isActive = false;
            };
        }, [])
    );

    useEffect(() => {
        if (accordionData.length > 0) {
            setActiveSections(accordionData.map((_, index) => index));
        }
    }, [accordionData]);

    return (
        <View style={{ flex: 1, backgroundColor: colors.background }}>
            <HeaderBar
                leftIcon={'back'}
                title={"History"}
            />

            <ScrollView
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={{
                    marginTop: 20,
                    paddingBottom:100,
                }}
            >
                <RBSheet
                    ref={refRBSheet}
                    closeOnDragDown={true}
                    height={180}
                    openDuration={100}
                    customStyles={{
                        container: {
                            backgroundColor: colors.background,
                            borderTopLeftRadius: 15,
                            borderTopRightRadius: 15,
                        },
                        draggableIcon: {
                            width: 90,
                            backgroundColor: colors.borderColor,
                        },
                    }}
                >
                    {['csv', 'xlsx', 'pdf'].map((type, index) => (
                        <Ripple
                            key={index}
                            onPress={() => refRBSheet.current?.close()}
                            style={{
                                flexDirection: 'row',
                                alignItems: 'center',
                                paddingHorizontal: 20,
                                paddingVertical: 10,
                                borderBottomWidth: index < 2 ? 0.5 : 0,
                                borderBottomColor: colors.borderColor,
                            }}
                        >
                            <Image
                                style={{
                                    height: 18,
                                    width: 18,
                                    marginRight: 10,
                                    tintColor: colors.text,
                                }}
                                source={ICONS[type as keyof typeof ICONS]}
                            />
                            <Text style={{ ...FONTS.font, color: colors.title }}>{type.toUpperCase()}</Text>
                        </Ripple>
                    ))}
                </RBSheet>

                <View style={{ marginBottom: 5, flexDirection: 'row', marginHorizontal: 10 }}>
                    <View style={{ flex: 1, marginRight: 10 }}>
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
                            <Ripple onPress={() => setOpen(true)}>
                                <TextInput
                                    style={{
                                        ...FONTS.font,
                                        color: colors.title,
                                        paddingLeft: 45,
                                        paddingRight: 6,
                                        height: 46,
                                    }}
                                    value={date}
                                    editable={false}
                                />
                            </Ripple>
                            <Text style={{ alignSelf: 'center', ...FONTS.font, color: colors.text }}>-</Text>
                            <Ripple onPress={() => setOpen02(true)}>
                                <TextInput
                                    style={{
                                        ...FONTS.font,
                                        color: colors.title,
                                        paddingLeft: 6,
                                        height: 46,
                                    }}
                                    value={date02}
                                    editable={false}
                                />
                            </Ripple>
                        </View>
                    </View>

                    <Ripple
                        onPress={() => refRBSheet.current?.open()}
                        style={{
                            height: 48,
                            width: 48,
                            alignItems: 'center',
                            justifyContent: 'center',
                            borderRadius: SIZES.radius,
                            backgroundColor: COLORS.primary,
                        }}
                    >
                        <FeatherIcon size={20} color={COLORS.white} name="download" />
                    </Ripple>
                </View>

                <Accordion
                    containerStyle={{ paddingTop: 15 }}
                    sectionContainerStyle={[styles.accordionItem, { backgroundColor: colors.card }]}
                    activeSections={activeSections}
                    sections={accordionData}
                    touchableComponent={View}
                    expandMultiple={true}
                    renderHeader={(item, _, isActive) => (
                        <Ripple
                            onPress={() => {
                                if (item.transactionDescription.includes("Bet")) {
                                    handleHistoryBet(item.referenceId);
                                }
                            }}
                            style={styles.accordionHeader}
                        >
                            <View style={{
                                height: 35,
                                width: 35,
                                marginRight: 10,
                                borderRadius: SIZES.radius,
                                backgroundColor: colors.background
                            }}>
                                {item.coin}
                            </View>
                            <View>
                                <Text style={{ ...FONTS.font, color: colors.title, marginBottom: 5 }}>{item.transactionDescription}</Text>
                                <Text style={{ ...FONTS.fontXs, color: colors.text }}>{item.date}</Text>
                            </View>
                            <View
                                style={{
                                    alignItems:'center',
                                    justifyContent:'center',
                                    marginLeft:'auto',
                                }}>
                                <Text style={{ ...FONTS.font, color: item.amount.startsWith('+') ? COLORS.primary : COLORS.danger, marginBottom: 5 }}>{item.amount}</Text>
                            </View>

                        </Ripple>
                    )}
                    renderContent={(item) => (
                        <View style={[styles.accordionBody, { borderColor: colors.borderColor }]}>
                            <View>
                                <Text style={{ ...FONTS.fontXs, color: COLORS.primary, marginBottom: 5 }}>Reference ID</Text>
                                <Text style={{ ...FONTS.fontXs, color: colors.text }}>{item.referenceId}</Text>
                            </View>
                        </View>
                    )}
                    duration={300}
                    onChange={() => {}}
                />
            </ScrollView>

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
    accordionItem: {
        borderRadius: SIZES.radius,
        marginBottom: 10,
        marginHorizontal: 10,
        overflow: 'hidden',
        elevation: 8,
        shadowColor: 'rgba(0,0,0,.6)',
    } as ViewStyle,
    accordionHeader: {
        padding: 10,
        flexDirection: 'row',
        alignItems: 'center',
    } as ViewStyle,
    accordionBody: {
        borderTopWidth: 1,
        padding: 10,
        flexDirection: 'row',
        justifyContent: 'space-between',
    } as ViewStyle,
    modalOverlay: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
    },
});

export default HistoryLoad;
