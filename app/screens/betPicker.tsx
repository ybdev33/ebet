import React, {useState, useRef, useEffect} from "react";
import {
    View,
    Text,
    TouchableOpacity,
    StyleSheet,
    FlatList,
    Platform, TextInput,
    KeyboardAvoidingView,
} from "react-native";
import {COLORS, FONTS, SIZES} from "../constants/theme";
import {useTheme} from "@react-navigation/native";
import HeaderBet from "@/app/components/Headers/HeaderBet";
import FeatherIcon from "react-native-vector-icons/Feather";
import Button from '@/app/components/Button/Button';

import StepperInput from "@/app/components/Input/StepperInput";
import {GlobalStyleSheet} from "@/app/constants/styleSheet";
import BetLists from "@/app/components/bet/betLists";
import Divider from "@/app/components/Dividers/Divider";

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
    };

    const inputRefs = useRef<Array<TextInput | null>>([]);

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
                        paddingBottom: 70,
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
                    <View style={styles.numberDisplay}>
                        {selectedNumbers.map((num, index) => {
                            const isDisabled = index >= getDrawLength();
                            return (
                                <View key={index} style={styles.numberWrapper}>
                                    <TextInput
                                        ref={(ref) => inputRefs.current[index] = ref}
                                        style={[
                                            styles.numberTextInput,
                                            isDisabled && styles.numberTextInputDisabled,
                                        ]}
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
                                        textAlign="center"
                                        returnKeyType="next"
                                    />
                                    <Text style={[styles.underscore, isDisabled && {color: COLORS.dark}]}>_</Text>
                                </View>
                            );
                        })}
                    </View>
                </View>
            );
        } else if (item === "controls") {
            return (
                <View>
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
                                setValue={(value) => setDrawValue(value)}
                                currentIndex={drawIndex}
                                setCurrentIndex={setDrawIndex}
                                editable={false}
                                flatListRef={flatListRef}
                            />
                        </View>

                        <View style={[GlobalStyleSheet.col50]}>
                            <StepperInput
                                label="Target"
                                options={amtOptions}
                                value={amtValue}
                                setValue={setAmtValue}
                                currentIndex={amtIndex}
                                setCurrentIndex={setAmtIndex}
                                editable={true}
                                flatListRef={flatListRef}
                            />
                        </View>

                        <View style={[GlobalStyleSheet.col50]}>
                            <View
                                style={{ opacity: isRmbEnabled ? 1 : 0.5 }}
                                pointerEvents={isRmbEnabled ? 'auto' : 'none'}
                            >
                                <StepperInput
                                    label="Rambol"
                                    options={rmbOptions}
                                    value={rmbValue}
                                    setValue={setRmbValue}
                                    currentIndex={rmbIndex}
                                    setCurrentIndex={setRmbIndex}
                                    flatListRef={flatListRef}
                                />
                            </View>
                        </View>
                    </View>
                    <View style={GlobalStyleSheet.row}>
                        <View style={[GlobalStyleSheet.col33]}>
                            <Button
                                color={COLORS.primaryLight}
                                textColor={COLORS.text}
                                title={'Clear'}
                                onPress={handleClear}
                            />
                        </View>

                        <View style={[GlobalStyleSheet.col33]}>
                            <Button
                                color={COLORS.primaryLight}
                                textColor={COLORS.warning}
                                title={'Auto Pick'}
                                onPress={handleAutoPick}
                            />
                        </View>

                        <View style={GlobalStyleSheet.col33}>
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
                    <View
                        style={{
                            ...GlobalStyleSheet.card,
                            backgroundColor: colors.card,
                            marginTop: 20,
                            ...GlobalStyleSheet.shadow,
                        }}
                    >
                        <View
                            style={[
                                GlobalStyleSheet.container,
                                {
                                    padding: 0,
                                    flexDirection: 'row',
                                    alignItems: 'center',
                                    justifyContent: 'space-between',
                                    paddingHorizontal: 0,
                                    paddingVertical: 0,
                                    marginBottom: 12,
                                },
                            ]}
                        >
                            <View style={[styles.cardIco, {borderWidth: 1, borderColor: colors.border}]}>
                                <Text style={styles.cardText}>{allBets.length}</Text>
                            </View>

                            <Text
                                style={{
                                    ...FONTS.h6,
                                    color: COLORS.text,
                                    marginTop: 5,
                                    marginLeft: 10,
                                }}
                            >{`Bet${allBets.length === 1 ? '' : 's'}`}</Text>
                            <View style={{flexDirection: 'row', alignItems: 'center', marginLeft: 'auto'}}>
                                <Text style={[styles.cardText, {fontSize: 13, fontWeight: 300, marginRight: 10}]}>View All</Text>
                                <View>
                                    <FeatherIcon size={16} color={COLORS.white} name='maximize-2'/>
                                </View>
                            </View>
                        </View>

                        <TouchableOpacity style={[styles.iconButton, {backgroundColor: COLORS.primary}]} onPress={handleBet}>
                            <Text style={styles.buttonText}>Print</Text>
                            <FeatherIcon name="send" size={16} color={COLORS.title} style={styles.icon} />
                        </TouchableOpacity>
                    </View>

                    <View
                        style={{
                            ...GlobalStyleSheet.card,
                            backgroundColor: colors.card,
                            marginTop: 20,
                            ...GlobalStyleSheet.shadow,
                        }}
                    >
                        <View
                            style={[
                                {
                                    backgroundColor: colors.background,
                                    borderRadius: 8,
                                    flexDirection: 'row',
                                    height: 40,
                                    alignItems: 'center',
                                    width: '100%',
                                    ...GlobalStyleSheet.shadow,
                                },
                            ]}
                        >
                            <Text
                                numberOfLines={1}
                                style={{
                                    color: colors.text,
                                    ...styles.tableItemHead,
                                    flexShrink: 0,
                                    flexWrap: 'nowrap',
                                    minWidth: 150,
                                }}
                            >
                                Combination
                            </Text>
                            <Text numberOfLines={1} style={{color: colors.text, ...styles.tableItemHead}}>Amount</Text>
                            <View
                                style={{
                                    alignItems: 'flex-end',
                                }}
                            >
                                <Text style={{...FONTS.font, ...FONTS.fontMedium, color: colors.text}}>Draw</Text>
                            </View>
                        </View>

                        {allBets.length > 0 ? (
                            <View style={{ overflow: 'scroll' }}>
                                <BetLists
                                    key={allBets.length}
                                    navigate={props.navigation.navigate}
                                    destination="Trade"
                                    data={allBets}
                                    theme={theme}
                                />

                            </View>
                        ) : (
                            <Text style={{ color: COLORS.text, textAlign: "center", marginTop: 10 }}>
                                No bets placed yet.
                            </Text>
                        )}

                    </View>

                </View>
            )
                ;
        }
        return null;
    };

    const handleClear = () => {
        setSelectedNumbers(Array(6).fill(-1));
        setAmtIndex(0);
        setAmtValue(amtOptions[0]);
        setRmbIndex(0);
        setRmbValue(rmbOptions[0]);
        setTimeIndex(0);
        setTimeValue(timeOptions[0]);
        setDrawIndex(0);
        setDrawValue(filteredDrawOptions[0]);

        setAllBets([]);
    };

    return (
        <View style={[styles.container, {backgroundColor: colors.background}]}>
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
                <HeaderBet/>
            </View>
            <KeyboardAvoidingView
                behavior={Platform.OS === "ios" ? "padding" : undefined}
                style={{ flex: 1 }}
            >
                <FlatList
                    ref={flatListRef}
                    data={["grid", "selectedNumbers", "controls"]}
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
        width: 35,
        height: 35,
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: COLORS.dark,
        borderRadius: 35,
    },
    gridCellActive: {
        backgroundColor: COLORS.primary,
    },
    gridCellText: {
        color: COLORS.white,
    },
    selectedNumbers: {
        alignItems: "center",
        marginBottom: 15,
    },
    sectionTitle: {
        color: COLORS.dark,
        textAlign: "center",
        fontSize: 13,
        marginTop: 10,
        marginBottom: 15,
    },
    numberDisplay: {
        flexDirection: "row",
        justifyContent: "space-evenly",
        width: "100%",
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
        color: COLORS.text,
        fontSize: 27,
        fontWeight: "bold",
        textAlign: "center",
        marginTop: -27,
        paddingBottom: 15,
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
        color: COLORS.title,
        fontWeight: 'bold',
        fontSize: 16,
        marginRight: 5,
        paddingVertical: 1,
    },
    numberWrapper: {
        alignItems: 'center',
        justifyContent: 'center',
    },
    numberTextInput: {
        width: 30,
        height: 27,
        fontSize: 27,
        fontWeight: 'bold',
        color: COLORS.success,
        textAlign: 'center',
        paddingVertical: 0,
        paddingHorizontal: 0,
        lineHeight: 27,
    },
    numberTextInputDisabled: {
        fontSize: 27,
        color: COLORS.light,
    },
    underscore: {
        fontSize: 27,
        fontWeight: 'bold',
        marginTop: -20,
        color: COLORS.text,
        lineHeight: 27,
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