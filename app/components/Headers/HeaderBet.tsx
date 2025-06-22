import React from 'react';
import {Text, View, StyleSheet} from 'react-native';
import {useTheme} from '@react-navigation/native';
import {COLORS, FONTS} from '../../constants/theme';

const HeaderBet: React.FC = () => {
    const {colors} = useTheme();

    return (
        <View style={styles.container}>
            <View style={styles.creditContainer}>
                <View>
                    <Text style={[styles.creditText, {color: COLORS.success}]}>Credit</Text>
                    <Text style={[styles.amountText, {color: COLORS.text}]}>₱ 5,770.90</Text>

                </View>
            </View>
            <View style={styles.betContainer}>
                <Text style={[styles.betText, {color: COLORS.light}]}>Bet</Text>
            </View>
            <View style={styles.payContainer}>
                <View>
                    <Text style={[styles.creditText, {color: COLORS.danger}]}>Pay</Text>
                    <Text style={[styles.amountText, {color: COLORS.text}]}>₱ 1,234.50</Text>
                </View>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        height: 70,
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 15,
    },
    creditContainer: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
    },
    betContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    payContainer: {
        flex: 1,
        flexDirection: 'row',
        justifyContent: 'flex-end', // Align content to the right
        alignItems: 'center',
    },
    creditText: {
        ...FONTS.fontXs,
        ...FONTS.fontBold,
        marginBottom: 2,
    },
    amountText: {
        ...FONTS.h6,
    },
    betText: {
        ...FONTS.h5,
    },
});

export default HeaderBet;
