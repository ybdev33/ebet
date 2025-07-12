import React from 'react';
import { Modal, View, Text, StyleSheet, Image, ScrollView } from 'react-native';
import QRCode from 'react-native-qrcode-svg';
import { COLORS, FONTS, SIZES } from '../../constants/theme';

interface Combination {
    label: string;
    amount: number;
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
    return (
        <Modal transparent visible={visible} animationType="slide" onRequestClose={onClose}>
            <View style={styles.overlay}>
                <View style={styles.container}>
                    <Text style={styles.header}>Philippine Online Sweepstakes</Text>
                    <Text style={styles.subHeader}>Lucky8Swerty</Text>
                    <Text style={styles.receiptLabel}>OFFICIAL RECEIPT</Text>

                    <Text style={styles.info}>Draw Time: {drawTime}</Text>
                    <Text style={styles.info}>Bet Time: {betTime}</Text>

                    <View style={styles.table}>
                        {combinations.map((combo, index) => (
                            <View key={index} style={styles.row}>
                                <Text style={styles.cell}>{combo.label}</Text>
                                <Text style={styles.cell}>₱{combo.amount}</Text>
                                <Text style={styles.cell}>₱{combo.win}</Text>
                            </View>
                        ))}
                    </View>

                    <Text style={styles.total}>Total: ₱{total.toFixed(2)}</Text>

                    <View style={styles.qrSection}>
                        <QRCode value={reference} size={60} />
                        <Text style={styles.reference}>REFERENCE NUMBER</Text>
                        <Text style={styles.referenceValue}>{reference}</Text>
                    </View>
                </View>
            </View>
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
    container: {
        backgroundColor: '#fff',
        padding: 20,
        borderRadius: 10,
        width: '85%',
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
        width: '30%',
        textAlign: 'center',
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