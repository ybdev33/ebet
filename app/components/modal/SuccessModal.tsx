import React from 'react';
import { Text, View, StyleSheet, TouchableOpacity } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useTheme } from '@react-navigation/native';
import { COLORS, FONTS, SIZES } from '../../constants/theme';

interface SuccessModalProps {
    message: string;
    isSuccess: boolean;
    onClose: () => void;
}

const SuccessModal: React.FC<SuccessModalProps> = ({ message, isSuccess, onClose }) => {
    const { colors } = useTheme();

    return (
        <View style={[styles.container, { backgroundColor: colors.card }]}>
            <Ionicons
                name={isSuccess ? 'checkmark-circle' : 'close-circle'}
                style={styles.icon}
                color={isSuccess ? COLORS.success : COLORS.danger}
                size={60}
            />
            <Text style={[styles.title, { color: colors.text }]}>
                {isSuccess ? 'Success' : 'Error'}
            </Text>
            <Text style={[styles.message, { color: colors.text }]}>
                {message}
            </Text>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                <Text style={styles.closeText}>Close</Text>
            </TouchableOpacity>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        alignItems: 'center',
        paddingHorizontal: 30,
        paddingVertical: 20,
        paddingBottom: 30,
        borderRadius: SIZES.radius,
        marginHorizontal: 30,
        minWidth: 340,
    },
    icon: {
        marginBottom: 8,
    },
    title: {
        ...FONTS.h5,
        marginBottom: 6,
    },
    message: {
        ...FONTS.font,
        textAlign: 'center',
    },
    closeButton: {
        marginTop: 10,
        padding: 10,
        backgroundColor: COLORS.primary,
        borderRadius: SIZES.radius,
    },
    closeText: {
        color: COLORS.white,
        ...FONTS.font,
    },
});

export default SuccessModal;
