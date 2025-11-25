import React, {useState, useRef, useEffect, useCallback, useMemo} from "react";
import {
    View,
    Text,
    TouchableOpacity,
    StyleSheet,
    FlatList,
    Platform, TextInput,
    KeyboardAvoidingView, Modal,
} from "react-native";
import {COLORS, FONTS, SIZES} from "../constants/theme";
import {useFocusEffect, useTheme} from "@react-navigation/native";
import HeaderBet from "@/app/components/Headers/HeaderBet";
import FeatherIcon from "react-native-vector-icons/Feather";
import Button from '@/app/components/Button/Button';

import StepperInput from "@/app/components/Input/StepperInput";
import {GlobalStyleSheet} from "@/app/constants/styleSheet";
import BetsModal from "@/app/components/modal/betsModal";
import ReceiptModal from "@/app/components/modal/ReceiptModal";
import Constants from "expo-constants";
import {getSession} from "@/app/helpers/sessionHelper";
import SuccessModal from "@/app/components/modal/SuccessModal";

const { GAMING_DOMAIN } = Constants.expoConfig?.extra || {};

const BetPicker: React.FC = (props) => {
    const {colors} = useTheme();
    const theme = useTheme();
    const [selectedNumbers, setSelectedNumbers] = useState<number[]>(Array(6).fill(-1));
    const flatListRef = useRef<FlatList>(null);

    const timeOptions = ["2 PM", "5 PM", "9 PM"];
    const drawOptionsMap: { [key: string]: string[] } = {
        "2 PM": ["S2", "S3"],
        "5 PM": ["S2", "S3"],
        "9 PM": ["S2", "S3", "L2", "L3", "4D", "P3"],
    };
    const amtOptions = ["", "1", "5", "10", "15", "20", "25", "30"];
    const [amtIndex, setAmtIndex] = useState(0);
    const [amtValue, setAmtValue] = useState(amtOptions[amtIndex]);

    const rmbOptions = ["", "1", "5", "10", "15", "20", "25", "30"];
    const [rmbIndex, setRmbIndex] = useState(0);
    const [rmbValue, setRmbValue] = useState(rmbOptions[rmbIndex]);

    const [timeIndex, setTimeIndex] = useState(0);
    const [timeValue, setTimeValue] = useState(timeOptions[timeIndex]);

    const [drawIndex, setDrawIndex] = useState(0);
    const [filteredDrawOptions, setFilteredDrawOptions] = useState<string[]>(drawOptionsMap[timeValue]);
    const [drawValue, setDrawValue] = useState(filteredDrawOptions[drawIndex]);
    const isRmbEnabled = drawValue === "L3" || drawValue === "S3";

    const gridNumbers = Array.from({length: 6}, () =>
        Array.from({length: 10}, (_, colIndex) => colIndex)
    );

    const handleTimeChange = (index: number) => {
        setTimeIndex(index);
        const newTimeValue = timeOptions[index];
        setTimeValue(newTimeValue);

        const updatedDrawOptions = drawOptionsMap[newTimeValue];
        setFilteredDrawOptions(updatedDrawOptions);

        setDrawIndex(0);
        setDrawValue(updatedDrawOptions[0]);
    };

    const handleDrawChange = (index: number) => {
        setDrawValue(filteredDrawOptions[index]);

        const updated = [...selectedNumbers];
        const updatedIndex = getDrawLength();

        const updateMap: Record<number, number[]> = {
            3: [2],
            4: [3],
            6: [4, 5],
        };

        updateMap[updatedIndex]?.forEach(pos => {
            updated[pos] = -1;
        });

        setSelectedNumbers(updated);

        setTimeout(() => {
            const nextIndexToFocus = updated.findIndex(val => val === -1);
            if (nextIndexToFocus !== -1) {
                inputRefs.current[nextIndexToFocus]?.focus();
            }
        }, 300);
    };
    
    const getDrawLength = () => {
        const drawLengths: { [key: string]: number } = {
            S2: 2,
            S3: 3,
            L2: 2,
            L3: 3,
            '4D': 4,
            P3: 6,
        };

        return drawLengths[drawValue] || 2;
    };

    const handleSelectNumber = (rowIndex: number, number: number) => {
        if (rowIndex >= getDrawLength()) return;

        const updatedSelection = [...selectedNumbers];
        updatedSelection[rowIndex] = number;
        setSelectedNumbers(updatedSelection);
    };

    const handleAutoPick = () => {
        const drawCount = getDrawLength();
        const updatedSelection = [...selectedNumbers];

        for (let i = 0; i < drawCount; i++) {
            updatedSelection[i] = gridNumbers[i][Math.floor(Math.random() * gridNumbers[i].length)];
        }

        setSelectedNumbers(updatedSelection);

        targetRef.current?.focus();
    };

    const [allBets, setAllBets] = useState<any[]>([]);
    const isAddEnabled  = selectedNumbers.filter(n => n !== -1).length >= getDrawLength() &&
        (
            (amtValue !== "") ||
            (isRmbEnabled && rmbValue !== "")
        );

    const handleBet = (mergeIfExists = false) => {
        const time = timeValue.match(/\d+/)?.[0] || '';
        const draw = time + drawValue;

        const filteredNumbers = selectedNumbers.filter(num => num !== -1);

        let newBets = [...allBets];
        let newId = (newBets.length + 1).toString();

        const addOrMergeBet = (isRmb: boolean, amountValue: string) => {
            if (!amountValue) return;

            const prefix = isRmb ? "R " : "T ";
            const combination = [prefix, ...filteredNumbers];

            if (mergeIfExists) {
                const existingBetIndex = newBets.findIndex(bet =>
                    bet.draw === draw &&
                    bet.isRmb === isRmb &&
                    Array.isArray(bet.combination) &&
                    bet.combination.length === combination.length &&
                    bet.combination.every((val, idx) => val === combination[idx])
                );

                if (existingBetIndex !== -1) {
                    const existingAmount = Number(newBets[existingBetIndex].amount);
                    const additionalAmount = Number(amountValue);
                    newBets[existingBetIndex].amount = (existingAmount + additionalAmount).toString();
                    return;
                }
            }

            newBets.push({
                id: newId,
                draw,
                amount: amountValue,
                isRmb,
                combination,
            });
            newId = (Number(newId) + 1).toString();
        };

        if (amtValue !== "") {
            addOrMergeBet(false, amtValue);
        }

        if (isRmbEnabled && rmbValue !== "") {
            addOrMergeBet(true, rmbValue);
        }

        setAllBets(newBets);

        handleClear(true); 
    };

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
    const [autoPrint, setAutoPrint] = useState(false);

    const handlePrint = async () => {
        try {
            const user = await getSession('userSession');
            const userId = user.data.userId;

            const betsPayload = allBets.map(bet => ({
                drawCategory: bet.draw,
                winCombination: bet.combination.slice(1).join(""),
                amount: Number(bet.amount),
                isRambol: bet.isRmb ? 1 : 0,
            }));

            const body = JSON.stringify({
                authorId: userId,
                dateTimeApp: new Date().toISOString(),
                drawTime: timeValue,
                bets: betsPayload,
            });

            const response = await fetch(`${GAMING_DOMAIN}/api/Common/CreateUserBet`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    // Authorization: 'Settings a2luZ3MzOiF0ZXJ5U3dldGk=',
                },
                body: body
            });
            console.log("body", body);

            const result = await response.json();
            console.log("result", result);

            if (response.ok && result.status === 1) {
                console.log("result.data.bets", result.data.bets);

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
                    reference: result.data.transCode
                });

                await fetchUserLoad();
                setShowReceipt(true);
                setShowBetsModal(false);

                setAutoPrint(true);

                handleClear();
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

    const handleDeleteBet = (idToRemove: number) => {
        setAllBets(prev => prev.filter(item => item.id !== idToRemove));
    };

    const inputRefs = useRef<Array<TextInput | null>>([]);
    const targetRef = useRef<TextInput>(null);
    const rambolRef = useRef<TextInput>(null);
    const [showBetsModal, setShowBetsModal] = useState(false);
    const [amount, setAmount] = useState(0);
    const pay = useMemo(() => {
        return allBets.reduce((sum, bet) => sum + Number(bet.amount), 0);
    }, [allBets]);

    const fetchUserLoad = async () => {
        try {
            const user = await getSession('userSession');
            const userId = user.data.userId;

            const response = await fetch(`${GAMING_DOMAIN}/api/LoadManagement/GetUserLoad?authorId=${userId}`);
            const result = await response.json();

            if (response.ok) {
                const fetchedAmount = result.data?.amount || 0;
                setAmount(fetchedAmount);
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
                if (isActive) await fetchUserLoad();
            })();

            return () => {
                isActive = false;
            };
        }, [])
    );

    useEffect(() => {
        setTimeout(() => {
            inputRefs.current[0]?.focus();
        }, 300);
        console.log("Updated allBets:", allBets);
    }, [allBets]);

    const renderGridRow = ({item: row, index: rowIndex}: { item: number[]; index: number }) => {
        const isDisabled = rowIndex >= getDrawLength();

        return (
            <View key={`row-${rowIndex}`} style={styles.gridRow}>
                {row.map((number) => (
                    <TouchableOpacity
                        key={number}
                        style={[
                            styles.gridCell,
                            selectedNumbers[rowIndex] === number && !isDisabled && styles.gridCellActive,
                            isDisabled && styles.gridCellDisabled,
                        ]}
                        onPress={() => handleSelectNumber(rowIndex, number)}
                        disabled={isDisabled}
                    >
                        <Text style={[styles.gridCellText, isDisabled && styles.gridCellTextDisabled]}>
                            {number}
                        </Text>
                    </TouchableOpacity>
                ))}
            </View>
        );
    };

    const renderContent = ({item}: { item: string }) => {
        if (item === "grid") {
            return (
                <FlatList
                    ref={flatListRef}
                    data={gridNumbers}
                    renderItem={renderGridRow}
                    keyExtractor={(_, index) => `row-${index}`}
                    contentContainerStyle={{
                        paddingBottom: 10,
                        ...(Platform.OS === 'web' && { flexGrow: 1 }),
                    }}
                    keyboardShouldPersistTaps="handled"
                    nestedScrollEnabled={true}
                />
            );
        } else if (item === "selectedNumbers") {
            return (
                <View style={styles.selectedNumbers}>
                    <Text style={styles.sectionTitle}>You Selected Numbers</Text>
                    <View style={{ flexDirection: 'row', justifyContent: 'center', alignItems: 'center', position: 'relative', width: '100%' }}>
                        <View style={styles.numberDisplay}>
                            {selectedNumbers.map((num, index) => {
                                const isDisabled = index >= getDrawLength();
                                return (
                                    <View key={index} style={styles.numberWrapper}>
                                        <TextInput
                                            ref={(ref) => inputRefs.current[index] = ref}
                                            style={[styles.numberTextInput, isDisabled && styles.numberTextInputDisabled]}
                                            editable={!isDisabled}
                                            keyboardType="numeric"
                                            maxLength={1}
                                            value={num !== -1 ? num.toString() : ""}
                                            onChangeText={(text) => {
                                                const updated = [...selectedNumbers];
                                                if (text === "" || text === "\u200B") {
                                                    updated[index] = -1;
                                                    setSelectedNumbers(updated);
                                                    return;
                                                }
                                                const n = parseInt(text, 10);
                                                if (!isNaN(n)) {
                                                    updated[index] = n;
                                                    setSelectedNumbers(updated);
                                                    for (let next = index + 1; next < selectedNumbers.length; next++) {
                                                        if (next < getDrawLength()) {
                                                            inputRefs.current[next]?.focus();
                                                            break;
                                                        }
                                                    }
                                                }
                                            }}
                                            onKeyPress={({ nativeEvent }) => {
                                                if (nativeEvent.key === "Backspace" && selectedNumbers[index] === -1) {
                                                    const prevIndex = index - 1;
                                                    if (prevIndex >= 0) {
                                                        const updated = [...selectedNumbers];
                                                        updated[prevIndex] = -1;
                                                        setSelectedNumbers(updated);
                                                        inputRefs.current[prevIndex]?.focus();
                                                    }
                                                }
                                            }}
                                            onSubmitEditing={() => {
                                                targetRef.current?.focus();
                                            }}
                                            textAlign="center"
                                            returnKeyType="next"
                                        />
                                        <Text style={[styles.underscore, isDisabled && {color: COLORS.dark}]}>_</Text>
                                    </View>
                                );
                            })}
                        </View>

                        {/* Floating Auto Pick button */}
                        <TouchableOpacity
                            style={styles.autoPickButton}
                            onPress={handleAutoPick}
                        >
                            <FeatherIcon name="shuffle" size={24} color={COLORS.dark} />
                        </TouchableOpacity>
                    </View>
                </View>
            );
        } else if (item === "controls") {
            return (
                <View style={{ marginTop: 15 }}>
                    <View style={[GlobalStyleSheet.row]}>
                        <View style={[GlobalStyleSheet.col50]}>
                            <StepperInput
                                label={timeValue}
                                options={timeOptions}
                                value=""
                                setValue={(value) => handleTimeChange(timeOptions.indexOf(value))}
                                currentIndex={timeIndex}
                                setCurrentIndex={handleTimeChange}
                                editable={false}
                                flatListRef={flatListRef}
                            />
                        </View>

                        <View style={[GlobalStyleSheet.col50]}>
                            <StepperInput
                                label={drawValue}
                                options={filteredDrawOptions}
                                value=""
                                setValue={(value) => handleDrawChange(filteredDrawOptions.indexOf(value))}
                                currentIndex={drawIndex}
                                setCurrentIndex={setDrawIndex}
                                editable={false}
                                flatListRef={flatListRef}
                            />
                        </View>

                        <View style={[GlobalStyleSheet.col50]}>
                            <StepperInput
                                ref={targetRef}
                                label="Target"
                                options={amtOptions}
                                value={amtValue}
                                setValue={setAmtValue}
                                currentIndex={amtIndex}
                                setCurrentIndex={setAmtIndex}
                                editable={true}
                                flatListRef={flatListRef}
                                onSubmitEditing={() => {
                                    if (isRmbEnabled) {
                                        rambolRef.current?.focus();
                                    } else {
                                        handleBet();
                                    }
                                }}
                                style={{
                                    container: { marginVertical: 8 },
                                    label: { ...FONTS.h6 },
                                    value: { ...FONTS.h6 },
                                    button: { backgroundColor: COLORS.primaryLight, paddingVertical: 5, paddingHorizontal: 10 },
                                    buttonText: { ...FONTS.h6 }
                                }}
                            />
                        </View>

                        <View style={[GlobalStyleSheet.col50]}>
                            <View
                                style={{ opacity: isRmbEnabled ? 1 : 0.5 }}
                                pointerEvents={isRmbEnabled ? 'auto' : 'none'}
                            >
                                <StepperInput
                                    ref={rambolRef}
                                    label="Rambol"
                                    options={rmbOptions}
                                    value={rmbValue}
                                    setValue={setRmbValue}
                                    currentIndex={rmbIndex}
                                    setCurrentIndex={setRmbIndex}
                                    flatListRef={flatListRef}
                                    onSubmitEditing={handleBet}
                                />
                            </View>
                        </View>
                    </View>
                    <View style={GlobalStyleSheet.row}>
                        <View style={[GlobalStyleSheet.col50]}>
                            <Button
                                color={COLORS.primaryLight}
                                textColor={COLORS.text}
                                title={'Clear'}
                                onPress={handleClear}
                            />
                        </View>

                        <View style={GlobalStyleSheet.col50}>
                            <TouchableOpacity
                                style={[
                                    styles.iconButton,
                                    {
                                        opacity: isAddEnabled ? 1 : 0.5,
                                    },
                                ]}
                                onPress={handleBet}
                                disabled={!isAddEnabled}
                            >
                                <Text style={styles.buttonText}>Add</Text>
                                <FeatherIcon name="shopping-cart" size={16} color={COLORS.title} style={styles.icon} />
                            </TouchableOpacity>
                        </View>

                    </View>

                    <TouchableOpacity
                        style={[
                            styles.iconButton,
                            {
                                backgroundColor: COLORS.primary,
                                opacity: allBets.length > 0 ? 1 : 0.5,
                                marginTop: 10
                            },
                        ]}
                        onPress={() => handlePrint()}
                        disabled={allBets.length === 0}
                    >
                        <Text style={styles.buttonText}>Print</Text>
                        <FeatherIcon name="send" size={16} color={COLORS.title} style={styles.icon} />
                    </TouchableOpacity>

                    <BetsModal
                        visible={showBetsModal}
                        onClose={() => setShowBetsModal(false)}
                        data={allBets}
                        navigate={props.navigation.navigate}
                        onPrint={handlePrint}
                        onDelete={handleDeleteBet}
                    />

                    <ReceiptModal
                        visible={showReceipt}
                        onClose={() => setShowReceipt(false)}
                        drawTime={receiptData.drawTime}
                        betTime={receiptData.betTime}
                        combinations={receiptData.combinations}
                        total={receiptData.total}
                        reference={receiptData.reference}
                        autoPrint={autoPrint}
                    />

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
                </View>
            )
                ;
        }
        return null;
    };

    const handleClear = (isBet = false) => {
        setSelectedNumbers(Array(6).fill(-1));
        setAmtIndex(0);
        setAmtValue(amtOptions[0]);
        setRmbIndex(0);
        setRmbValue(rmbOptions[0]);
        setTimeIndex(0);
        setTimeValue(timeOptions[0]);
        setDrawIndex(0);
        setDrawValue(filteredDrawOptions[0]);

        if(!isBet)
        {
            setAllBets([]);
        }

    };

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
            <View
                style={{
                    backgroundColor: colors.card,
                    shadowColor: "rgba(0,0,0,.6)",
                    shadowOffset: {
                        width: 0,
                        height: 4,
                    },
                    shadowOpacity: 0.3,
                    shadowRadius: 4.65,

                    elevation: 8,
                    marginBottom: 10,
                }}
            >
                <HeaderBet amount={amount} pay={pay} betCount={allBets.length} onPressViewAll={() => setShowBetsModal(true)} />
            </View>
            <KeyboardAvoidingView
                behavior={Platform.OS === "ios" ? "padding" : undefined}
                style={{ flex: 1 }}
            >
                <FlatList
                    ref={flatListRef}
                    data={["selectedNumbers", "grid", "controls"]}
                    renderItem={({item}) => renderContent({item})}
                    keyExtractor={(_, index) => `row-${index}`}
                    contentContainerStyle={{paddingBottom: 70}}
                    keyboardShouldPersistTaps="always"
                    nestedScrollEnabled={true}
                />
            </KeyboardAvoidingView>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 20,
        ...(Platform.OS === 'web' && {
            height: '100vh',
            overflowY: 'auto',
            scrollbarWidth: 'none',
            msOverflowStyle: 'none',
        }),
    },
    gridContainer: {
        marginBottom: 0
    },
    gridRow: {
        flexDirection: "row",
        justifyContent: "space-between",
        marginVertical: 2
    },
    gridCell: {
        width: 30,
        height: 30,
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: COLORS.dark,
        borderRadius: 35,
    },
    gridCellActive: {
        backgroundColor: COLORS.primary,
    },
    gridCellText: {
        ...FONTS.h6,
        color: COLORS.white,
    },
    selectedNumbers: {
        alignItems: "center",
        marginBottom: 5,
    },
    sectionTitle: {
        ...FONTS.h6,
        color: COLORS.dark,
        textAlign: "center",
        fontSize: 13,
        marginBottom: 10,
    },
    numberDisplay: {
        flexDirection: "row",
        justifyContent: "space-evenly",
        width: "82%",
        flexWrap: "nowrap",
    },
    numberWrapper: {
        alignItems: "center",
        marginHorizontal: 5,
    },
    numberText: {
        color: COLORS.success,
        fontSize: 27,
        fontWeight: "bold",
        textAlign: "center",
        width: 24
    },
    underscore: {
        ...FONTS.h6,
        color: COLORS.text,
        fontSize: 27,
        fontWeight: "bold",
        textAlign: "center",
        marginTop: -22,
        paddingBottom: 10,
    },
    gridCellDisabled: {
        opacity: 0.5,
    },
    gridCellTextDisabled: {
        color: COLORS.primaryLight,
    },
    buttonStyle: {
        marginBottom: 10
    },
    cardIco: {
        height: 35,
        width: 35,
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: SIZES.radius,
        backgroundColor: "#000",
    },
    cardText: {
        color: COLORS.primary,
        textAlign: "center",
        fontSize: 18,
        fontWeight: "bold",
        verticalAlign: "middle",
    },
    tableItem: {
        ...FONTS.font,
        paddingHorizontal: 15,
        flexBasis: 140,
        flexShrink: 2,
    },
    tableItemHead: {
        ...FONTS.font,
        paddingHorizontal: 15,
        flexBasis: 140,
        flexShrink: 2,
    },
    iconButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: COLORS.warning,
        paddingVertical: 10,
        borderRadius: 8,
    },
    icon: {
    },
    buttonText: {
        ...FONTS.h6,
        color: COLORS.title,
        marginRight: 5,
        paddingVertical: 2,
    },
    numberTextInput: {
        ...FONTS.h5,
        width: 30,
        height: 27,
        color: COLORS.success,
        textAlign: 'center',
        paddingVertical: 0,
        paddingHorizontal: 0,
    },
    numberTextInputDisabled: {
        fontSize: 27,
        color: COLORS.light,
    },
    modalOverlay: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
    },
    autoPickButton: {
        position: 'absolute',
        right: 0,
        top: '20%',
        transform: [{ translateY: -12 }], // vertically center
        padding: 5,
        borderRadius: "100%",
        backgroundColor: COLORS.warning,
        justifyContent: 'center',
        alignItems: 'center',
    },
});

if (Platform.OS === 'web')
{
    const style = document.createElement("style");
    style.innerHTML = `
            ::-webkit-scrollbar {
                display: none;
            }
        `;
    document.head.appendChild(style);
}

export default BetPicker;