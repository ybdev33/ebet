import React, { useEffect, useState, useRef } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    FlatList,
    ActivityIndicator,
    Platform,
    PermissionsAndroid,
    Switch,
    Pressable,
    Animated,
    Modal,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { BleManager, Device, Characteristic } from 'react-native-ble-plx';
import { Buffer } from 'buffer';
import { useTheme } from '@react-navigation/native';
import { FONTS, COLORS } from '../constants/theme';
import SuccessModal from '../components/modal/SuccessModal';
import { generateReceiptText, splitChunks, escPosQR, escposImageFromBase64RN } from '../printer/ReceiptPrinter';
import { sendInChunks } from '../printer/printerUtils';
import { logoBase64 } from '../../assets/logoBase64';

global.Buffer = global.Buffer || Buffer;

const PrinterScreen: React.FC = () => {
    const { colors } = useTheme();

    // BLE state
    const [manager] = useState(new BleManager());
    const [devicesMap, setDevicesMap] = useState<{ [key: string]: Device }>({});
    const [connectedDevice, setConnectedDevice] = useState<Device | null>(null);
    const [writableChar, setWritableChar] = useState<Characteristic | null>(null);
    const [scanning, setScanning] = useState(false);
    const [loading, setLoading] = useState(false);
    const [bluetoothEnabled, setBluetoothEnabled] = useState(true);
    const [currentMTU, setCurrentMTU] = useState<number>(23);

    // Modal state
    const [modalVisible, setModalVisible] = useState(false);
    const [modalMessage, setModalMessage] = useState('');
    const [isSuccess, setIsSuccess] = useState(false);

    // Animation
    const scanAnim = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        const init = async () => {
            await requestPermissions();

            // 🔵 Load saved bluetoothEnabled state
            const saved = await AsyncStorage.getItem("bluetoothEnabled");
            if (saved !== null) {
                const enabled = JSON.parse(saved);
                setBluetoothEnabled(enabled);

                if (!enabled) {
                    stopScan();
                    return; // Do not scan if toggled OFF previously
                }
            }

            await restoreLastConnectedDevice();
            startScan();
        };
        init();

        return () => {
            stopScan();
            manager.destroy();
        };
    }, []);

    useEffect(() => {
        Animated.loop(
            Animated.sequence([
                Animated.timing(scanAnim, { toValue: 1, duration: 900, useNativeDriver: true }),
                Animated.timing(scanAnim, { toValue: 0, duration: 900, useNativeDriver: true }),
            ])
        ).start();
    }, []);

    // ------------------- BLE HELPERS -------------------
    const requestPermissions = async () => {
        if (Platform.OS === "android") {
            try {
                await PermissionsAndroid.requestMultiple([
                    PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
                    PermissionsAndroid.PERMISSIONS.BLUETOOTH_SCAN,
                    PermissionsAndroid.PERMISSIONS.BLUETOOTH_CONNECT,
                ]);
            } catch (e) {
                // ignore
            }
        }
    };

    const connectToDevice = async (device: Device) => {
        stopScan();
        try {
            setLoading(true);
            const connected = await device.connect();
            await connected.discoverAllServicesAndCharacteristics();
            setConnectedDevice(connected);
            AsyncStorage.setItem("lastConnectedDevice", connected.id);

            // 1. OPTIMIZATION: Request higher MTU on Android
            let mtu = 512; // Target size
            if (Platform.OS === "android") {
                try {
                    const negotiatedDevice = await connected.requestMTU(512);
                    mtu = negotiatedDevice.mtu;
                } catch (e) {
                    console.log("MTU negotiation failed, using default");
                    mtu = 23;
                }
            }
            setCurrentMTU(mtu);

            const services = await connected.services();
            for (const service of services) {
                const characteristics = await service.characteristics();
                // 2. OPTIMIZATION: Prefer "WriteWithoutResponse" for speed
                const writeChar = characteristics.find((c) => c.isWritableWithoutResponse);

                // Fallback to "WriteWithResponse" if the fast one isn't available
                const backupChar = characteristics.find((c) => c.isWritableWithResponse);

                if (writeChar) {
                    setWritableChar(writeChar);
                    break;
                } else if (backupChar) {
                    setWritableChar(backupChar);
                    break;
                }
            }
        } catch (e: any) {
            setModalMessage("Failed to connect to device");
            setIsSuccess(false);
            setModalVisible(true);
        } finally {
            setLoading(false);
        }
    };

    const disconnectDevice = async (): Promise<void> => {
        if (!connectedDevice) return;

        try {
            setLoading(true); // show loading during disconnect
            await connectedDevice.cancelConnection();
        } catch (e: any) {
            console.log("Disconnect error:", e);
        } finally {
            setConnectedDevice(null);
            setWritableChar(null);
            await AsyncStorage.removeItem("lastConnectedDevice");
            startScan();
            setLoading(false); // hide loading after disconnect
        }
    };

    const restoreLastConnectedDevice = async () => {
        const lastDeviceId = await AsyncStorage.getItem("lastConnectedDevice");
        if (!lastDeviceId) return;
        try {
            const device = await manager.connectToDevice(lastDeviceId);
            await device.discoverAllServicesAndCharacteristics();
            setConnectedDevice(device);

            if (Platform.OS === "android") {
                try { await device.requestMTU(512); } catch (e) {}
            }

            const services = await device.services();
            for (const service of services) {
                const characteristics = await service.characteristics();
                const writeChar = characteristics.find((c) => c.isWritableWithoutResponse)
                    || characteristics.find((c) => c.isWritableWithResponse);
                if (writeChar) { setWritableChar(writeChar); break; }
            }
        } catch (e) {
            AsyncStorage.removeItem("lastConnectedDevice");
        }
    };

    // ------------------- SCAN -------------------
    const startScan = () => {
        if (scanning) return;
        setScanning(true);
        setDevicesMap({});
        manager.startDeviceScan(null, null, (error, device) => {
            if (error) {
                setModalMessage("Failed to scan devices");
                setIsSuccess(false);
                setModalVisible(true);
                stopScan();
                return;
            }
            if (!device?.id) return;
            setDevicesMap(prev => ({ ...prev, [device.id]: device }));
        });
    };

    const stopScan = () => {
        try { manager.stopDeviceScan(); } catch(e) {}
        setScanning(false);
        setLoading(false);
    };

    const printTest = async () => {
        if (!connectedDevice || !writableChar) {
            setModalMessage("Please connect to a printer first");
            setIsSuccess(false);
            setModalVisible(true);
            return;
        }

        try {
            setLoading(true);

            const text = "\n\n\nConnected: Print test 123\n\n\n\n\n\n\n";
            const textBytes = Buffer.from(text, "utf-8");

            await sendInChunks(textBytes, connectedDevice, writableChar, currentMTU);

            setModalMessage("Test sent to printer!");
            setIsSuccess(true);
            setModalVisible(true);
        } catch (e: any) {
            setModalMessage(`Print Error: ${e.message || "Unknown error"}`);
            setIsSuccess(false);
            setModalVisible(true);

            await disconnectDevice();
        } finally {
            setLoading(false);
        }
    };

    // ------------------- RENDER -------------------
    const rssiToBars = (rssi?: number) => {
        if (rssi === undefined || rssi === null) return 0;
        if (rssi >= -50) return 4;
        if (rssi >= -60) return 3;
        if (rssi >= -70) return 2;
        if (rssi >= -80) return 1;
        return 0;
    };

    const handleBluetoothToggle = async (value: boolean) => {
        setBluetoothEnabled(value);
        await AsyncStorage.setItem("bluetoothEnabled", JSON.stringify(value));

        if (!value) {
            // Wait for disconnect to fully complete before proceeding
            await disconnectDevice();
            // Now you can safely navigate or do other actions here
            // e.g., navigation.navigate('HomeScreen');
        } else {
            startScan();
        }
    };

    const renderSignal = (rssi?: number) => {
        const bars = rssiToBars(rssi);
        return (
            <View style={{ flexDirection: 'row', alignItems: 'flex-end', height: 16 }}>
                {[1,2,3,4].map(i => (
                    <View key={i} style={{
                        width: 3,
                        marginLeft: 3,
                        height: i <= bars ? 3*i : 3,
                        backgroundColor: i <= bars ? COLORS.primary : colors.border,
                        borderRadius: 1
                    }} />
                ))}
            </View>
        );
    };

    const renderDevice = ({ item }: { item: Device }) => {
        const isConnected = connectedDevice?.id === item.id;
        const rssi = (item as any).rssi as number | undefined;

        return (
            <Pressable
                android_ripple={{ color: colors.border }}
                style={[
                    styles.deviceRow,
                    isConnected && { backgroundColor: colors.card },
                    (loading || isConnected) && { opacity: 0.6 }
                ]}
                onPress={() => !loading && connectToDevice(item)}

                disabled={loading || isConnected}
            >
                <View style={styles.leftCol}>
                    <View style={[styles.deviceIcon, { backgroundColor: colors.card }]}>
                        <Text style={FONTS.fontMedium}>🖨️</Text>
                    </View>
                    <View style={{ marginLeft: 12, flex: 1 }}>
                        <Text style={[FONTS.fontMedium, { color: COLORS.light }]} numberOfLines={1}>{item.name || 'Unknown device'}</Text>
                        <Text style={[FONTS.fontXs, { color: colors.text, fontWeight: '500'}]} numberOfLines={1}>{item.id}</Text>
                    </View>
                </View>
                <View style={styles.rightCol}>
                    {renderSignal(rssi)}
                    <Text style={[FONTS.fontXs, { marginTop: 6, color: isConnected ? COLORS.success : COLORS.primary }]}>
                        {isConnected ? 'Connected' : 'Tap to connect'}
                    </Text>
                </View>
            </Pressable>
        );
    };

    // @ts-ignore
    return (
        <View style={{ flex: 1, backgroundColor: colors.background }}>
            <View style={[styles.headerSection, { backgroundColor: COLORS.primary }]}>
                <View>
                    <Text style={[FONTS.h2, { color: COLORS.title }]}>Bluetooth</Text>
                    <Text style={[FONTS.fontMedium]}>{connectedDevice ? 'Connected' : 'Available devices'}</Text>
                </View>
                <View style={{ alignItems: 'flex-end' }}>
                    <Text style={[FONTS.fontMedium]}>Bluetooth</Text>
                    <Switch
                        value={bluetoothEnabled}
                        onValueChange={handleBluetoothToggle}
                        trackColor={{ true: COLORS.primary }}
                        thumbColor={bluetoothEnabled ? COLORS.success : colors.card}
                    />
                </View>
            </View>

            {bluetoothEnabled && (
                <FlatList
                    data={Object.values(devicesMap)}
                    keyExtractor={item => item.id}
                    renderItem={renderDevice}
                    contentContainerStyle={{ paddingBottom: 170 }}
                    ListHeaderComponent={
                        <>
                            <View style={[styles.quickRow, { backgroundColor: colors.card }]}>
                                <View>
                                    <Text style={[FONTS.fontMedium, { color: colors.text }]}>Paired devices</Text>
                                    <Text style={[FONTS.fontXs, { color: colors.text }]}>
                                        {Object.values(devicesMap).filter(d => d.isConnected).length} paired
                                    </Text>
                                </View>

                                <View style={styles.quickItemRight}>
                                    <Animated.View
                                        style={[
                                            styles.scanPulse,
                                            {
                                                opacity: scanAnim.interpolate({
                                                    inputRange: [0, 1],
                                                    outputRange: [0.35, 1],
                                                }),
                                                backgroundColor: COLORS.primary,
                                            },
                                        ]}
                                    />
                                    <TouchableOpacity
                                        style={[styles.scanBtnSmall]}
                                        onPress={startScan}
                                        disabled={scanning}
                                    >
                                        {scanning ? (
                                            <ActivityIndicator color={COLORS.primary} />
                                        ) : (
                                            <Text style={[FONTS.fontSm, { color: COLORS.primary }]}>
                                                Scan
                                            </Text>
                                        )}
                                    </TouchableOpacity>
                                </View>
                            </View>
                        </>
                    }
                    ListEmptyComponent={!scanning && bluetoothEnabled && (
                        <Text style={[FONTS.fontMedium, { textAlign: 'center', marginTop: 40, color: colors.text }]}>
                            No devices found
                        </Text>
                    )}
                />
            )}

            {bluetoothEnabled && connectedDevice && (
                <View style={{ position: 'absolute', left: 0, right: 0, bottom: 0, backgroundColor: colors.card, padding: 16, borderTopWidth: 1, borderTopColor: colors.border }}>
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'top' }}>
                        <View>
                            <Text style={[FONTS.fontMedium, { color: COLORS.success }]}>Connected</Text>
                            <Text style={[FONTS.h6, { color: colors.text, marginTop: 2 }]}>{connectedDevice.name || connectedDevice.id}</Text>
                        </View>
                        <View style={{ width: 160 }}>
                            <TouchableOpacity style={{ backgroundColor: COLORS.primary, paddingVertical: 12, borderRadius: 8, alignItems: 'center', marginBottom: 8 }} onPress={printTest} disabled={loading}>
                                {loading ? <ActivityIndicator color={COLORS.white}/> : <Text style={[FONTS.h6, {...FONTS.fontMedium, color:COLORS.white}]}>Print Test</Text>}
                            </TouchableOpacity>
                            <TouchableOpacity style={{ borderWidth: 1, borderColor: colors.border, paddingVertical: 10, borderRadius: 8, alignItems: 'center', backgroundColor: COLORS.dark }} onPress={disconnectDevice}>
                                <Text style={[FONTS.h6, {...FONTS.fontMedium, color: COLORS.darkText }]}>Disconnect</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            )}

            <Modal
                animationType="fade"
                transparent={true}
                visible={modalVisible}
                onRequestClose={() => setModalVisible(false)}
            >
                <View style={{ flex:1, justifyContent:'center', alignItems:'center', backgroundColor:'rgba(0,0,0,0.5)' }}>
                    <SuccessModal
                        message={modalMessage}
                        isSuccess={isSuccess}
                        onClose={() => setModalVisible(false)}
                    />
                </View>
            </Modal>
        </View>
    );
};

const styles = StyleSheet.create({
    headerSection: { paddingHorizontal: 18, paddingTop: 18, paddingBottom: 14, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
    quickRow: { paddingHorizontal: 16, paddingVertical: 12, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
    quickItemRight: { flexDirection: 'row', alignItems: 'center' },
    scanPulse: { width: 10, height: 10, borderRadius: 10, marginRight: 10 },
    scanBtnSmall: { paddingHorizontal: 12, paddingVertical: 8, borderRadius: 8 },
    deviceRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 14, paddingHorizontal: 16, borderBottomWidth: 1 },
    leftCol: { flexDirection: 'row', alignItems: 'center', flex: 1 },
    deviceIcon: { width: 44, height: 44, borderRadius: 8, justifyContent: 'center', alignItems: 'center' },
    rightCol: { alignItems: 'flex-end', justifyContent: 'center' },
});

export default PrinterScreen;
