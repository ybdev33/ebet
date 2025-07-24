import React from 'react';
import { Modal, View, Text, StyleSheet, Image, ScrollView, ImageBackground } from 'react-native';
import QRCode from 'react-native-qrcode-svg';
import { IMAGES } from '../../constants/theme';
import Constants from "expo-constants";

const { GAMING_NAME } = Constants.expoConfig?.extra || {};

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
                <ImageBackground
                    source={IMAGES.luckySwerty}
                    style={styles.container}
                    imageStyle={{ opacity: 0.1 }}
                    resizeMode="repeat"
                >
                    <Text style={styles.header}>Philippine Online Sweepstakes</Text>
                    <Text style={styles.subHeader}>{GAMING_NAME}</Text>
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
                </ImageBackground>
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
    background: {
        flex: 1,
        width: '100%',
        justifyContent: 'center',
        alignItems: 'center',
    },
    container: {
        backgroundColor: 'rgba(255,255,255,0.95)',
        padding: 20,
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
