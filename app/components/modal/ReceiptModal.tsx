import React, {useState, useEffect} from 'react';
import { Modal, View, Text, StyleSheet, Image, ScrollView, ImageBackground, TouchableWithoutFeedback, TouchableOpacity, } from 'react-native';
import QRCode from 'react-native-qrcode-svg';
import { COLORS, IMAGES, FONTS } from '../../constants/theme';
import Constants from "expo-constants";
import { ActivityIndicator } from "react-native";

import { generateReceiptText, splitChunks, escPosQR, escposImageFromBase64RN } from '../../printer/ReceiptPrinter';
import { usePrinter } from "../../printer/usePrinter";
import { logoBase64 } from '../../../assets/logoBase64';

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
    autoPrint?: boolean;
}

const ReceiptModal: React.FC<ReceiptModalProps> = ({
                                                       visible,
                                                       onClose,
                                                       drawTime,
                                                       betTime,
                                                       combinations,
                                                       total,
                                                       reference,
                                                       autoPrint = false
                                                   }) => {
    const { connectLastPrinter, printBuffer, connectedDevice } = usePrinter();
    const [printerReady, setPrinterReady] = useState(false);
    const [isPrinting, setIsPrinting] = useState(true);

    useEffect(() => {
        if (!visible) return;

        const connect = async () => {
            try {
                await connectLastPrinter();
                setPrinterReady(true);
            } catch (e) {
                console.log("Connection failed:", e);
                setPrinterReady(false);
                setIsPrinting(false);
            }
        };

        connect();
    }, [visible]);

    useEffect(() => {
        if (visible && autoPrint && printerReady) {
            const doAutoPrint = async () => {
                setIsPrinting(true);
                try {
                    await printReceipt();
                } catch (e) {
                    console.log("Auto print failed:", e);
                } finally {
                    setIsPrinting(false);
                }
            };

            doAutoPrint();
        }
    }, [printerReady, autoPrint, visible]);

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

    const printReceipt = async (retryCount = 0) => {
        try {
            const logo = escposImageFromBase64RN(logoBase64, 384);

            const items = combinations.map(c => ({
                label: c.label,
                amount: c.amount,
                draw: c.draw,
                win: c.win,
            }));

            const receiptText = generateReceiptText({
                header: "Philippine Online Sweepstakes",
                appName: "eBet",
                officialText: "OFFICIAL RECEIPT",
                betTime: formatBetTime(betTime),
                items,
            });

            const textBytes = Buffer.from(receiptText, "utf-8");

            const ESC = "\x1B";
            const qrBytes = Buffer.from(
                `${ESC}a\x01` + escPosQR(reference) + `${ESC}a\x00`,
                "binary"
            );

            const referenceBytes = Buffer.from(
                `\n${ESC}a\x01REFERENCE NUMBER\n${reference}\n\n\n\n${ESC}a\x00`,
                "utf-8"
            );

            const finalBuffer = Buffer.concat([logo, textBytes, qrBytes, referenceBytes]);

            await printBuffer(finalBuffer);
        } catch (e) {
            console.log(`Print attempt ${retryCount + 1} failed:`, e);

            const MAX_RETRIES = 1;
            const RETRY_DELAY_MS = 1000;

            if (retryCount < MAX_RETRIES) {
                console.log(`Retrying in ${RETRY_DELAY_MS / 1000} seconds...`);
                await new Promise(res => setTimeout(res, RETRY_DELAY_MS));
                await printReceipt(retryCount + 1); // retry
            } else {
                alert("Failed to print receipt after multiple attempts");
            }
        }
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
                                    <Text style={[styles.cell, styles.headerCell]}>Bet</Text>
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

                            <TouchableOpacity
                                onPress={async () => {
                                    setIsPrinting(true);
                                    await printReceipt();
                                    setIsPrinting(false);
                                }}
                                style={[
                                    styles.printButton,
                                    (!printerReady || isPrinting) && { opacity: 0.4 }
                                ]}
                                disabled={!printerReady || isPrinting}
                            >
                                {isPrinting ? (
                                    <ActivityIndicator size="small" color="#fff" />
                                ) : (
                                    <Text style={[FONTS.h6, { color: COLORS.white }]}>Print 🖨️</Text>
                                )}
                            </TouchableOpacity>
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
        position: 'relative',
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
        ...FONTS.fontMedium,
        color: '#222',
    },
    subHeader: {
        ...FONTS.fontMedium,
        fontSize: 13,
        marginTop: -5,
        marginBottom: 5,
        color: '#666',
    },
    receiptLabel: {
        ...FONTS.fontMedium,
        fontSize: 16,
        marginBottom: 10,
    },
    info: {
        ...FONTS.fontMedium,
        fontSize: 13,
        alignSelf: 'flex-start',
        marginBottom: 4,
        color: '#444',
    },
    table: {
        ...FONTS.fontMedium,
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
        ...FONTS.fontMedium,
        fontSize: 13,
        width: '23%',
        textAlign: 'center',
    },
    headerRow: {
        borderColor: '#ccc',
    },
    headerCell: {
        ...FONTS.fontSm,
        color: '#222',
    },
    total: {
        ...FONTS.fontMedium,
        marginTop: 10,
        fontSize: 15,
        color: '#222',
        alignSelf: 'flex-start',
    },
    qrSection: {
        marginTop: 15,
        alignItems: 'center',
    },
    reference: {
        ...FONTS.fontMedium,
        fontSize: 11,
        marginTop: 5,
        color: '#666',
    },
    referenceValue: {
        ...FONTS.fontMedium,
        fontSize: 13,
    },
    printButton: {
        position: 'absolute',
        bottom: -15,
        right: -28,
        backgroundColor: COLORS.dark,
        padding: 10,
        borderRadius: 8,
        alignItems: 'center',

        shadowColor: '#000',
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: 0.3,
        shadowRadius: 4,

        elevation: 5,
    }
});

export default ReceiptModal;
