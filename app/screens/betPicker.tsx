import React, {useState, useRef} from "react";
import {
    View,
    Text,
    TouchableOpacity,
    StyleSheet,
    FlatList,
    Image,
    ScrollView,
    Platform, Animated,
} from "react-native";
import {COLORS, FONTS, ICONS, IMAGES, SIZES} from "../constants/theme";
import {useTheme} from "@react-navigation/native";
import HeaderBet from "@/app/components/Headers/HeaderBet";
import FeatherIcon from "react-native-vector-icons/Feather";
import Button from '@/app/components/Button/Button';

import DividerIcon from '@/app/components/Dividers/DividerIcon';
import StepperInput from "@/app/components/Input/StepperInput";
import {GlobalStyleSheet} from "@/app/constants/styleSheet";
import SocialIcon from "@/app/components/Socials/SocialIcon";
import FontAwesome from "react-native-vector-icons/FontAwesome";
import WidgetPieChart from "@/app/components/WidgetPieChart";
import {Checkbox} from "react-native-paper";
import BetLists from "@/app/components/bet/betLists";
import Divider from "@/app/components/Dividers/Divider";
import Ripple from "react-native-material-ripple";

const BalanceList = [
    {
        id: '1',
        coinName: '123',
        amount: "2,566",
        tag: "9L2",
    },
    {
        id: '2',
        coinName: '345',
        amount: '88,456',
        tag: "9S2",
    },
    {
        id: '3',
        coinName: '678901',
        amount: '88,456',
        tag: "P3",
    },
    {
        id: '4',
        coinName: '1123',
        amount: '88,456',
        tag: "4D",
    },
    {
        id: '5',
        coinName: '000000',
        amount: '88,456',
        tag: "P3",
    },
]

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
    const amtOptions = ["1", "5", "10", "15", "20", "25", "30"];

    const [timeIndex, setTimeIndex] = useState(0);
    const [timeValue, setTimeValue] = useState(timeOptions[timeIndex]);

    const [drawIndex, setDrawIndex] = useState(0);
    const [filteredDrawOptions, setFilteredDrawOptions] = useState<string[]>(drawOptionsMap[timeValue]);
    const [drawValue, setDrawValue] = useState(filteredDrawOptions[drawIndex]);

    const [amtIndex, setAmtIndex] = useState(0);
    const [amtValue, setAmtValue] = useState(amtOptions[amtIndex]);

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

    const handleBet = () => {
        const betDetails = {
            time: timeValue,
            draw: drawValue,
            amount: amtValue,
            selectedNumbers: selectedNumbers.filter(num => num !== -1), // Only include selected numbers
        };

        console.log("Bet details:", betDetails);

        // Example of how to store it in an array (or send to a backend)
        const betArray = [
            betDetails.time,
            betDetails.draw,
            betDetails.amount,
            betDetails.selectedNumbers,
        ];

        console.log("Bet Array:", betArray);

        // Append the new bet to the existing array of bets
        setAllBets(prevBets => {
            return [...prevBets, betArray];  // Spread previous bets and add the new one
        });
    };

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
                    data={gridNumbers}
                    renderItem={renderGridRow}
                    keyExtractor={(_, index) => `row-${index}`}
                    style={styles.gridContainer}
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
                                    {!isDisabled && num !== -1 ? (
                                        <Text style={[styles.numberText]}>
                                            {num}
                                        </Text>
                                    ) : (
                                        <Text style={[styles.numberText, {color: COLORS.light}]}>
                                            {}
                                        </Text>
                                    )}
                                    <Text
                                        style={[
                                            styles.underscore,
                                            isDisabled && {color: COLORS.dark},
                                        ]}
                                    >
                                        _
                                    </Text>
                                </View>
                            );
                        })}
                    </View>
                </View>
            );
        } else if (item === "controls") {
            return (
                <View>
                    <Divider color={COLORS.darkBorder}/>

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

                            <StepperInput
                                label="Amt"
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
                            <Button
                                style={styles.buttonStyle}
                                color={COLORS.primaryLight}
                                textColor={COLORS.text}
                                title={'Clear'}
                                onPress={handleClear}
                            />
                            <Button
                                style={styles.buttonStyle}
                                color={COLORS.primaryLight}
                                textColor={COLORS.warning}
                                title={'Auto Pick'}
                                onPress={handleAutoPick}
                            />
                            <Button
                                style={styles.buttonStyle}
                                color={COLORS.success}
                                textColor={COLORS.title}
                                title={"Bet"}
                                onPress={handleBet}
                            />
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
                                <View>
                                    <FeatherIcon size={16} color={COLORS.white} name='maximize-2'/>
                                </View>
                            </View>
                        </View>

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
                            <Text numberOfLines={1} style={{color: colors.text, ...styles.tableItemHead}}>Amt</Text>
                            <View
                                style={{
                                    alignItems: 'flex-end',
                                }}
                            >
                                <Text style={{...FONTS.font, ...FONTS.fontMedium, color: colors.text}}>Draw</Text>
                            </View>
                        </View>

                        {allBets.length > 0 ? (
                            <View style={{ maxHeight: 300, overflow: 'scroll' }}>
                                {allBets.map((bet, index) => (
                                    <BetLists
                                        key={`bet-${index}`}
                                        navigate={props.navigation.navigate}
                                        destination="Trade"
                                        data={BalanceList}
                                        theme={theme}
                                    />
                                ))}
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
                    marginBottom: 15,
                }}
            >
                <HeaderBet/>
            </View>
            <FlatList
                ref={flatListRef}
                data={["selectedNumbers", "grid", "controls"]}
                renderItem={({item}) => renderContent({item})}
                keyExtractor={(_, index) => `row-${index}`}
                contentContainerStyle={{paddingBottom: 250}}
                keyboardShouldPersistTaps="handled"
                nestedScrollEnabled={true}
            />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        padding: 20
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
        marginVertical: 7,
        alignItems: "center",
    },
    sectionTitle: {
        color: COLORS.text,
        textAlign: "center",
        fontSize: 13,
        marginBottom: 10,
    },
    numberDisplay: {
        flexDirection: "row",
        justifyContent: "space-evenly",
        width: "100%",
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
});

export default BetPicker;