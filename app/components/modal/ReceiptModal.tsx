import React from 'react';
import { Modal, View, Text, StyleSheet, Image, ScrollView, ImageBackground, TouchableWithoutFeedback, } from 'react-native';
import QRCode from 'react-native-qrcode-svg';
import { IMAGES } from '../../constants/theme';
import Constants from "expo-constants";

const { GAMING_NAME } = Constants.expoConfig?.extra || {};

interface Combination {
    label: string;
    amount: number;
    draw: string;
    win: number;
}

interface ReceiptModalProps {
    visible: boolean;
    onClose: () => void;
    drawTime: string;
    betTime: string;
    combinations: Combination[];
    total: number;
    reference: string;
}

const ReceiptModal: React.FC<ReceiptModalProps> = ({
                                                       visible,
                                                       onClose,
                                                       drawTime,
                                                       betTime,
                                                       combinations,
                                                       total,
                                                       reference,
                                                   }) => {

    const formatBetTime = (isoString: string) => {
        const date = new Date(isoString);
        const pad = (n: number) => n.toString().padStart(2, '0');

        const year = date.getFullYear().toString().slice(2);
        const month = pad(date.getMonth() + 1);
        const day = pad(date.getDate());
        const hours = pad(date.getHours());
        const minutes = pad(date.getMinutes());

        return `${year}-${month}-${day} ${hours}:${minutes}`;
    };

    return (
        <Modal transparent visible={visible} animationType="slide" onRequestClose={onClose}>
            <TouchableWithoutFeedback onPress={onClose}>
                <View style={styles.overlay}>
                    <View style={styles.backgroundContainer}>
                        <Image
                            source={IMAGES.luckySwerty}
                            style={styles.repeatingBackground}
                            resizeMode="repeat"
                        />

                        <View style={styles.container}>
                            <Text style={styles.header}>Philippine Online Sweepstakes</Text>
                            <Text style={styles.subHeader}>{GAMING_NAME}</Text>
                            <Text style={styles.receiptLabel}>OFFICIAL RECEIPT</Text>

                            <Text style={styles.info}>Bet Time: {formatBetTime(betTime)}</Text>
                            <View style={styles.table}>

                                <View style={[styles.row, styles.headerRow]}>
                                    <Text style={[styles.cell, styles.headerCell]}>Combination</Text>
                                    <Text style={[styles.cell, styles.headerCell]}>Amount</Text>
                                    <Text style={[styles.cell, styles.headerCell]}>Draw</Text>
                                    <Text style={[styles.cell, styles.headerCell]}>Win</Text>
                                </View>

                                {combinations.map((combo, index) => (
                                    <View key={index} style={styles.row}>
                                        <Text style={styles.cell}>{combo.label}</Text>
                                        <Text style={styles.cell}>₱{combo.amount}</Text>
                                        <Text style={styles.cell}>{combo.draw}</Text>
                                        <Text style={styles.cell}>₱{combo.win}</Text>
                                    </View>
                                ))}
                            </View>

                            <Text style={styles.total}>Total: ₱{typeof total === 'number' ? total.toFixed(2) : '0.00'}</Text>

                            <View style={styles.qrSection}>
                                <QRCode value={reference} size={60} />
                                <Text style={styles.reference}>REFERENCE NUMBER</Text>
                                <Text style={styles.referenceValue}>{reference}</Text>
                            </View>
                        </View>
                    </View>
                </View>
            </TouchableWithoutFeedback>
        </Modal>
    );
};

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.6)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    background: {
        flex: 1,
        width: '100%',
        justifyContent: 'center',
        alignItems: 'center',
    },
    backgroundContainer: {
        width: '90%',
        maxWidth: 400,
        padding: 20,
        borderRadius: 10,
        overflow: 'hidden',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'rgba(255,255,255,0.95)',
        position: 'relative',
    },

    repeatingBackground: {
        position: 'absolute',
        top: 0,
        left: 0,
        width: '400%',
        height: '400%',
        opacity: 0.1,
        zIndex: -1,
    },
    container: {
        borderRadius: 10,
        alignItems: 'center',
    },
    header: {
        fontWeight: 'bold',
        fontSize: 16,
        color: '#222',
    },
    subHeader: {
        fontSize: 13,
        marginBottom: 5,
        color: '#666',
    },
    receiptLabel: {
        fontWeight: 'bold',
        fontSize: 16,
        marginBottom: 10,
    },
    info: {
        fontSize: 12,
        alignSelf: 'flex-start',
        marginBottom: 4,
        color: '#444',
    },
    table: {
        marginTop: 10,
        width: '100%',
        borderTopWidth: 1,
        borderBottomWidth: 1,
        borderColor: '#ccc',
        paddingVertical: 5,
    },
    row: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingVertical: 4,
    },
    cell: {
        fontSize: 13,
        width: '23%',
        textAlign: 'center',
    },
    headerRow: {
        borderColor: '#ccc',
    },
    headerCell: {
        fontWeight: 'bold',
        color: '#222',
    },
    total: {
        marginTop: 10,
        fontWeight: 'bold',
        fontSize: 15,
        color: '#222',
        alignSelf: 'flex-start',
    },
    qrSection: {
        marginTop: 15,
        alignItems: 'center',
    },
    reference: {
        fontSize: 11,
        marginTop: 5,
        color: '#666',
    },
    referenceValue: {
        fontSize: 13,
        fontWeight: 'bold',
    },
});

export default ReceiptModal;
