import React, {useState, useEffect} from 'react';
import { Modal, View, Text, StyleSheet, Image, ScrollView, TouchableWithoutFeedback, TouchableOpacity, Platform, ActivityIndicator } from 'react-native';
import QRCode from 'react-native-qrcode-svg';
import { COLORS, IMAGES, FONTS } from '../../constants/theme'; // Assuming these are defined elsewhere
import Constants from "expo-constants"; // Used for GAMING_NAME
// import { ActivityIndicator } from "react-native"; // Already imported above

// Assume these imports are correct for your printing setup
import { generateReceiptText, escPosQR, escposImageFromBase64RN } from '../../printer/ReceiptPrinter';
import { usePrinter } from "../../printer/usePrinter";
import { logoBase64 } from '../../../assets/logoBase64';

// Retrieve GAMING_NAME from Expo config
const { GAMING_NAME } = Constants.expoConfig?.extra || {};

// --- Interface Definitions ---

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

// --- Helper Functions ---

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
    const [isPrinting, setIsPrinting] = useState(false);
    const [connectionError, setConnectionError] = useState<string | null>(null); // State for connection errors
    const [printError, setPrintError] = useState<string | null>(null);         // State for runtime printing errors

    // 1. Printer Connection Effect
    useEffect(() => {
        if (!visible || Platform.OS === "web") {
            setPrinterReady(false);
            setConnectionError(null);
            setPrintError(null);
            return;
        }

        const connect = async () => {
            setConnectionError(null);
            setPrinterReady(false);
            try {
                await connectLastPrinter();
                setPrinterReady(true);
            } catch (e) {
                console.log("Connection failed:", e);
                setConnectionError("Failed to connect to the printer. Ensure it is paired and on.");
            } finally {
                // Ensure setIsPrinting is false after connect attempt
                setIsPrinting(false);
            }
        };

        connect();

        // Cleanup function to clear state
        return () => {
            setPrinterReady(false);
            setConnectionError(null);
            setPrintError(null);
        };
    }, [visible]);


    // 2. Core Printing Logic with Retries (Throws on max retry failure)
    const printReceipt = async (retryCount = 0): Promise<void> => {
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
                appName: "luckyfortune.com",
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
                await printReceipt(retryCount + 1); // recursive retry
            } else {
                // Throw the error after exhausting retries
                const errorDetails = e instanceof Error ? e.message : String(e);
                throw new Error(`Failed to print receipt after multiple attempts: ${errorDetails}`);
            }
        }
    };


    // 3. Auto-Print Effect
    useEffect(() => {
        if (visible && autoPrint && printerReady) {
            const doAutoPrint = async () => {
                setIsPrinting(true);
                setPrintError(null); // Clear previous errors
                try {
                    await printReceipt();
                } catch (e) {
                    console.error("Auto print failed:", e);
                    const errorMessage = e instanceof Error ? e.message : "An unknown error occurred during auto-printing.";
                    setPrintError(errorMessage);
                } finally {
                    setIsPrinting(false);
                }
            };

            doAutoPrint();
        }
    }, [printerReady, autoPrint, visible]);


    // --- Render ---

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

                        <ScrollView contentContainerStyle={styles.container}>
                            <Text style={styles.header}>Philippine Online Sweepstakes</Text>
                            <Text style={styles.subHeader}>{GAMING_NAME || "eBet App"}</Text>
                            <Text style={styles.receiptLabel}>OFFICIAL RECEIPT</Text>

                            <Text style={styles.info}>Bet Time: {formatBetTime(betTime)}</Text>

                            <View style={styles.table}>
                                <View style={[styles.row, styles.headerRow]}>
                                    <Text style={[styles.cell, styles.headerCell, styles.betCell]}>Bet</Text>
                                    <Text style={[styles.cell, styles.headerCell, styles.amountCell]}>Amount</Text>
                                    <Text style={[styles.cell, styles.headerCell, styles.drawCell]}>Draw</Text>
                                    <Text style={[styles.cell, styles.headerCell, styles.winCell]}>Win</Text>
                                </View>

                                {combinations.map((combo, index) => (
                                    <View key={index} style={styles.row}>

                                        <Text style={[styles.cell, styles.betCell]}>{combo.label}</Text>
                                        <Text style={[styles.cell, styles.amountCell]}>₱{combo.amount}</Text>
                                        <Text style={[styles.cell, styles.drawCell]}>{combo.draw}</Text>
                                        <Text style={[styles.cell, styles.winCell]}>₱{combo.win}</Text>
                                    </View>
                                ))}
                            </View>

                            <Text style={styles.total}>Total: ₱{typeof total === 'number' ? total.toFixed(2) : '0.00'}</Text>

                            <View style={styles.qrSection}>
                                <QRCode value={reference} size={60} />
                                <Text style={styles.reference}>REFERENCE NUMBER</Text>
                                <Text style={styles.referenceValue}>{reference}</Text>
                            </View>

                            {Platform.OS !== "web" && (
                                <>
                                    <TouchableOpacity
                                        onPress={async () => {
                                            setIsPrinting(true);
                                            setPrintError(null); // Clear previous runtime errors
                                            try {
                                                await printReceipt();
                                            } catch (e) {
                                                console.error("Manual print failed:", e);
                                                const errorMessage = e instanceof Error ? e.message : "Failed to print.";
                                                setPrintError(errorMessage); // Set the error for display
                                            } finally {
                                                setIsPrinting(false);
                                            }
                                        }}
                                        style={[
                                            styles.printButton,
                                            (!printerReady || isPrinting) && { opacity: 0.4, backgroundColor: COLORS.dark }
                                        ]}
                                        disabled={!printerReady || isPrinting}
                                    >
                                        {isPrinting || !printerReady ? (
                                            <ActivityIndicator size="small" color="#fff" />
                                        ) : (
                                            <Text style={[FONTS.h6, { color: COLORS.white }]}>Print 🖨️</Text>
                                        )}
                                    </TouchableOpacity>

                                    {(connectionError || printError) && (
                                        <Text style={styles.errorText}>
                                            {connectionError || printError}
                                        </Text>
                                    )}
                                </>
                            )}
                        </ScrollView>
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
    backgroundContainer: {
        width: '90%',
        maxWidth: 400,
        padding: 0,
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
        padding: 20,
        minWidth: '100%',
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
        ...FONTS.fontSm,
        fontSize: 13,
    },
    betCell: {
        width: '25%',
        textAlign: 'left',
    },
    amountCell: {
        width: '30%',
        textAlign: 'center',
    },
    drawCell: {
        width: '20%',
        textAlign: 'center',
    },
    winCell: {
        width: '25%',
        textAlign: 'right',
    },
    headerRow: {
        borderColor: '#ccc',
    },
    headerCell: {
        ...FONTS.font,
        color: '#222',
        fontWeight: 'bold',
    },
    total: {
        ...FONTS.fontMedium,
        marginTop: 10,
        fontSize: 15,
        color: '#222',
        alignSelf: 'flex-start',
        fontWeight: 'bold',
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
        fontWeight: 'bold',
    },
    printButton: {
        position: 'absolute',
        bottom: 5,
        right: 5,
        backgroundColor: COLORS.dark,
        padding: 10,
        borderRadius: 8,
        alignItems: 'center',
        minWidth: 100,

        shadowColor: '#000',
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: 0.3,
        shadowRadius: 4,
        elevation: 5,
    },
    errorText: {
        ...FONTS.fontSm,
        margin: 15,
        fontSize: 11,
        color: 'red',
        textAlign: 'center',
        paddingHorizontal: 10,
    },
    statusText: {
        ...FONTS.fontSm,
        marginTop: 15,
        fontSize: 11,
        color: COLORS.dark, // A neutral color for status
        textAlign: 'center',
        paddingHorizontal: 10,
    }
});

export default ReceiptModal;