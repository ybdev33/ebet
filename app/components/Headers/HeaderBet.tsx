import React from 'react';
import { Text, View, StyleSheet, TouchableOpacity } from 'react-native';
import { useTheme } from '@react-navigation/native';
import { COLORS, FONTS, SIZES } from '../../constants/theme';
import FeatherIcon from 'react-native-vector-icons/Feather';

interface HeaderBetProps {
    amount: number;
    pay: number;
    betCount: number;
    onPressViewAll?: () => void;
}

const HeaderBet: React.FC<HeaderBetProps> = ({ amount, pay, betCount, onPressViewAll }) => {
    const { colors } = useTheme();

    return (
        <View style={styles.container}>
            <View style={styles.leftSection}>
                <Text style={[styles.sectionLabel, {color: COLORS.light, fontSize: SIZES.h5}]}>Bet</Text>
            </View>

            <View style={styles.middleSection}>
                <View style={styles.amountGroup}>
                    <Text style={[styles.sectionLabel, { color: COLORS.success }]}>Credit</Text>
                    <Text style={[styles.sectionAmount, { color: COLORS.text }]}>₱ {amount.toFixed(2)}</Text>
                </View>
                <View style={styles.amountGroup}>
                    <Text style={[styles.sectionLabel, { color: COLORS.danger }]}>Pay</Text>
                    <Text style={[styles.sectionAmount, { color: COLORS.text }]}>₱ {pay.toFixed(2)}</Text>
                </View>
            </View>

            <TouchableOpacity
                onPress={onPressViewAll}
                style={styles.cartButton}
            >
                <FeatherIcon name="shopping-cart" size={20} color={COLORS.white} />
                <Text style={styles.betCount}>{betCount}</Text>
            </TouchableOpacity>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        height: 50,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 10,
    },
    leftSection: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'flex-start',
    },
    middleSection: {
        flex: 5,
        flexDirection: 'row',
        justifyContent: 'space-around',
        alignItems: 'flex-start',
        marginRight: 20
    },
    amountGroup: {
        alignItems: 'flex-start',
    },
    sectionLabel: {
        ...FONTS.fontXs,
        ...FONTS.fontBold,
        marginBottom: 2,
    },
    sectionAmount: {
        ...FONTS.h6,
    },
    betText: {
        ...FONTS.h5,
    },
    cartButton: {
        borderRadius: SIZES.radius,
        position: 'relative',
        left: -5
    },
    betCount: {
        backgroundColor: COLORS.danger,
        borderRadius: 10,
        paddingHorizontal: 5,
        fontSize: 11,
        color: COLORS.white,
        position: 'absolute',
        top: -5,
        right: -8,
        minWidth: 16,
        textAlign: 'center',
    },
});

export default HeaderBet;
