import React, {useEffect} from 'react';
import {
    View,
    Text,
    StyleSheet,
    Image,
} from 'react-native';
import { useTheme } from '@react-navigation/native';
import { FONTS, COLORS, ICONS } from '../constants/theme';
import { LinearGradient } from 'expo-linear-gradient';
import { GlobalStyleSheet } from '../constants/styleSheet';

interface DrawResultProps {
    dashData: {
        resultList: {
            combination: string;
            drawCategory: string;
        }[];
        totalBets: number;
        totalCancelled: number;
        totalCommision: number;
        totalHits: number;
    }
}

const DrawResult: React.FC<DrawResultProps> = ({dashData}) => {
    const { colors } = useTheme();
    const theme = useTheme();

    return (
        <View style={{paddingBottom: 70}}>
            <Text style={{...FONTS.h6, color:colors.title, padding: 15}}>Draw Result</Text>

            <View style={{paddingHorizontal: 10}}>
            {(dashData?.resultList || []).map((data, index) => {
                return (
                    <View key={index}>
                        <View style={[
                            styles.coinList,
                            { backgroundColor: colors.card },
                            theme.dark && {
                                backgroundColor: colors.background,
                                paddingHorizontal: 0,
                            },
                            !theme.dark && {
                                ...GlobalStyleSheet.shadow,
                            }
                        ]}>
                            <View
                                style={[{
                                    height:48,
                                    width:48,
                                    alignItems:'center',
                                    justifyContent:'center',
                                    borderRadius:12,
                                    backgroundColor:colors.background,
                                    borderWidth:1,
                                    borderColor:colors.borderColor,
                                    marginRight:12,
                                },theme.dark && {
                                    borderWidth:0,
                                    backgroundColor:colors.card,
                                }]}
                            >
                                <Text style={styles.categoryText}>
                                    {data.drawCategory}
                                </Text>
                            </View>

                            <View style={styles.amountInfo}>
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
        </View>
    )
}

const styles = StyleSheet.create({
    coinList: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        borderRadius: 12,
        paddingHorizontal: 6,
        paddingVertical: 5,
        marginHorizontal: 15,
    },
    coinInfo: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
    },
    gradientSeparator: {
        height: 1,
        width: '100%',
        bottom: 0,
    },
    categoryText: {
        color: COLORS.white,
        fontWeight: 'bold',
        textAlign: 'center',
    },
    digitContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        flexWrap: 'wrap',
    },
    digitCircle: {
        width: 26,
        height: 26,
        borderRadius: 26,
        alignItems: 'center',
        justifyContent: 'center',
        marginHorizontal: 2,
    },
    digitText: {
        color: COLORS.dark,
        fontWeight: 'bold',
        fontSize: 14,
    },
});

export default DrawResult;
