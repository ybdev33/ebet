import React from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
} from 'react-native';
import { useTheme } from '@react-navigation/native';
import { FONTS, COLORS } from '../constants/theme';
import { LinearGradient } from 'expo-linear-gradient';
import { GlobalStyleSheet } from '../constants/styleSheet';

interface DrawResultProps {
    dashData: {
        resultList: {
            combination: string;
            drawCategory: string;
            gross?: number;
            hits?: number;
            net?: number;
            commission?: number;
        }[];
        totalBets: number;
        totalCancelled: number;
        totalCommision: number;
        totalHits: number;
    }
}

const DrawResult: React.FC<DrawResultProps> = ({dashData}) => {
    const {colors} = useTheme();
    const theme = useTheme();

    return (
        <View style={{paddingBottom: 70}}>
            <Text style={{...FONTS.h6, color:colors.title, padding: 15}}>Draw Result</Text>

            <ScrollView horizontal showsHorizontalScrollIndicator={true}>
                <View>
                    <View style={[styles.row, {backgroundColor: colors.card}]}>
                        <Text style={[styles.headerCell, {flex: 1, minWidth: 90}]}>Draw</Text>
                        <Text style={[styles.headerCell, {flex: 1, minWidth: 60}]}>Gross</Text>
                        <Text style={[styles.headerCell, {flex: 1, minWidth: 50}]}>Hits</Text>
                        <Text style={[styles.headerCell, {flex: 1, minWidth: 50}]}>Net</Text>
                        <Text style={[styles.headerCell, {flex: 1, minWidth: 80}]}>Comm</Text>
                        <Text style={[styles.headerCell, {flex: 2, minWidth: 150, marginLeft: 15, textAlign: "left"}]}>Result</Text>
                    </View>

                    {(dashData?.resultList || []).map((data, index) => {
                        const isGrandTotal = data.drawCategory === "GrandTotal";

                        return (
                            <View key={index}>
                                <View style={[
                                    styles.row,
                                    { backgroundColor: colors.card },
                                    theme.dark && { backgroundColor: colors.background },
                                    !theme.dark && { ...GlobalStyleSheet.shadow }
                                ]}>
                                    <Text style={[styles.categoryText, {flex: 1, minWidth: 90}]}>
                                        {isGrandTotal ? "Grand Total" : data.drawCategory}
                                    </Text>

                                    <Text style={[styles.cell, {flex: 1, minWidth: 60}]}>{data.gross}</Text>
                                    <Text style={[styles.cell, {flex: 1, minWidth: 50}]}>{data.hits}</Text>
                                    <Text style={[styles.cell, {flex: 1, minWidth: 50}]}>{data.net}</Text>
                                    <Text style={[styles.cell, {flex: 1, minWidth: 80}]}>{data.commission}</Text>

                                    <View style={[styles.amountInfo, {flex: 2, minWidth: 150}]}>
                                        {isGrandTotal ? (
                                            <View style={styles.cell}></View>
                                        ) : (
                                            <View style={styles.digitContainer}>
                                                {data.combination.split('').map((digit, digitIndex) => {
                                                    const digitColors = [
                                                        COLORS.warning,
                                                        COLORS.success,
                                                        COLORS.info,
                                                        COLORS.danger,
                                                        '#2196F3',
                                                        COLORS.primaryLight,
                                                    ];
                                                    return (
                                                        <View
                                                            key={digitIndex}
                                                            style={[
                                                                styles.digitCircle,
                                                                { backgroundColor: digitColors[digitIndex] || COLORS.primary },
                                                            ]}
                                                        >
                                                            <Text style={styles.digitText}>{digit}</Text>
                                                        </View>
                                                    );
                                                })}
                                            </View>
                                        )}
                                    </View>
                                </View>

                                {theme.dark &&
                                    <LinearGradient
                                        start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
                                        colors={["rgba(255,255,255,.0)", "rgba(255,255,255,.1)", "rgba(255,255,255,0)"]}
                                        style={styles.gradientSeparator}
                                    />
                                }
                            </View>
                        );
                    })}
                </View>
            </ScrollView>
        </View>
    )
}

const styles = StyleSheet.create({
    row: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 8,
        paddingHorizontal: 10,
        borderRadius: 8,
        marginHorizontal: 10,
        marginVertical: 4,
    },
    headerCell: {
        fontWeight: 'bold',
        color: COLORS.text,
        textAlign: 'center',
    },
    cell: {
        color: COLORS.text,
        textAlign: 'center',
    },
    gradientSeparator: {
        height: 1,
        width: '100%',
    },
    categoryText: {
        fontWeight: 'bold',
        color: COLORS.primary,
        textAlign: 'center',
    },
    digitContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        flexWrap: 'wrap',
        justifyContent: 'flex-start',
    },
    digitCircle: {
        width: 24,
        height: 24,
        borderRadius: 24,
        alignItems: 'center',
        justifyContent: 'center',
        marginHorizontal: 2,
    },
    digitText: {
        color: COLORS.dark,
        fontWeight: 'bold',
        fontSize: 12,
    },
    amountInfo: {
        marginLeft: 15,
        justifyContent: 'flex-start',
        alignItems: 'flex-start',
    },
});

export default DrawResult;
