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
    BackHandler,
    Alert,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { BleManager, Device, Characteristic, BleError } from 'react-native-ble-plx';
import { Buffer } from 'buffer';
import { useTheme, useFocusEffect } from '@react-navigation/native';
import { useNavigation } from '@react-navigation/native';
import { FONTS, COLORS } from '../constants/theme';
import SuccessModal from '../components/modal/SuccessModal';
import { sendInChunks } from '../printer/printerUtils';

global.Buffer = global.Buffer || Buffer;

const PrinterScreen: React.FC = () => {
    const { colors } = useTheme();

    // BLE state - Lazy init to ensure Manager is only created once
    const [manager] = useState(() => new BleManager());
    const [devicesMap, setDevicesMap] = useState<{ [key: string]: Device }>({});
    const [connectedDevice, setConnectedDevice] = useState<Device | null>(null);
    const [writableChar, setWritableChar] = useState<Characteristic | null>(null);
    const [scanning, setScanning] = useState(false);

    // Loading States
    const [loading, setLoading] = useState(false);
    const [connecting, setConnecting] = useState(false);
    const [disconnecting, setDisconnecting] = useState(false);

    // Settings
    const [bluetoothEnabled, setBluetoothEnabled] = useState(true);
    const [currentMTU, setCurrentMTU] = useState<number>(23);

    // Modal state
    const [modalVisible, setModalVisible] = useState(false);
    const [modalMessage, setModalMessage] = useState('');
    const [isSuccess, setIsSuccess] = useState(false);

    // Animation
    const scanAnim = useRef(new Animated.Value(0)).current;

    const navigation = useNavigation();

    // ------------------- EFFECTS -------------------
    useEffect(() => {
        const init = async () => {
            const permGranted = await requestPermissions();
            if (!permGranted) {
                Alert.alert('Permission Required', 'Bluetooth permissions are required to connect to printers.');
                return;
            }

            const saved = await AsyncStorage.getItem('bluetoothEnabled');
            if (saved !== null) {
                const enabled = JSON.parse(saved);
                setBluetoothEnabled(enabled);
                if (!enabled) {
                    stopScan();
                    return;
                }
            }

            // Automatically restore previous connection or start scan
            await restoreLastConnectedDevice();
            if (!connectedDevice) {
                startScan();
            }
        };

        init();

        // Cleanup on unmount
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

    useFocusEffect(
        React.useCallback(() => {
            const onBackPress = () => {
                // Block back if busy
                if (connecting || disconnecting || loading) return true;

                navigation.navigate('drawernavigation', {
                    screen: 'BottomNavigation',
                    params: { screen: 'Profile' },
                })

                return true; // handled
            };

            const subscription = BackHandler.addEventListener('hardwareBackPress', onBackPress);

            return () => subscription.remove();
        }, [connecting, disconnecting, loading])
    );

    // ------------------- BLE HELPERS -------------------
    const requestPermissions = async (): Promise<boolean> => {
        if (Platform.OS === 'android') {
            try {
                if (Platform.Version >= 31) {
                    const result = await PermissionsAndroid.requestMultiple([
                        PermissionsAndroid.PERMISSIONS.BLUETOOTH_SCAN,
                        PermissionsAndroid.PERMISSIONS.BLUETOOTH_CONNECT,
                    ]);
                    return (
                        result['android.permission.BLUETOOTH_CONNECT'] === PermissionsAndroid.RESULTS.GRANTED &&
                        result['android.permission.BLUETOOTH_SCAN'] === PermissionsAndroid.RESULTS.GRANTED
                    );
                } else {
                    const granted = await PermissionsAndroid.request(
                        PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION
                    );
                    return granted === PermissionsAndroid.RESULTS.GRANTED;
                }
            } catch (e) {
                console.warn(e);
                return false;
            }
        }
        return true;
    };

    const connectToDevice = async (device: Device) => {
        stopScan();

        // Check if the device has a valid name
        if (!device.name || device.name.trim() === "") {
            console.log("Cannot connect: device has no name");
            setModalMessage('Cannot connect: device has no name');
            setIsSuccess(false);
            setModalVisible(true);
            return; // exit early
        }

        setConnecting(true);
        setLoading(true);

        try {
            const connected = await device.connect();
            await connected.discoverAllServicesAndCharacteristics();

            setConnectedDevice(connected);
            await AsyncStorage.setItem('lastConnectedDevice', connected.id);

            let mtu = 512;
            if (Platform.OS === 'android') {
                try {
                    mtu = (await connected.requestMTU(512)).mtu;
                } catch (e) {
                    mtu = 23;
                }
            }
            setCurrentMTU(mtu);

            // Find Writable Characteristic
            const services = await connected.services();
            let foundChar = null;
            for (const service of services) {
                const characteristics = await service.characteristics();
                const writeChar = characteristics.find(c => c.isWritableWithoutResponse)
                    || characteristics.find(c => c.isWritableWithResponse);
                if (writeChar) {
                    foundChar = writeChar;
                    break;
                }
            }

            if (foundChar) {
                setWritableChar(foundChar);
            } else {
                throw new Error("No writable characteristic found");
            }

        } catch (e: any) {
            console.log(e);
            setConnectedDevice(null);
            setModalMessage('Failed to connect to device');
            setIsSuccess(false);
            setModalVisible(true);
        } finally {
            setLoading(false);
            setConnecting(false);
        }
    };

    const disconnectDevice = async (): Promise<void> => {
        if (!connectedDevice) return;

        try {
            setDisconnecting(true);
            await connectedDevice.cancelConnection();
        } catch (e: any) {
            console.log('Disconnect error:', e);
        } finally {
            setConnectedDevice(null);
            setWritableChar(null);
            await AsyncStorage.removeItem('lastConnectedDevice');
            setDisconnecting(false);

            // Restart scan if bluetooth is still enabled
            if (bluetoothEnabled) {
                startScan();
            }
        }
    };

    const restoreLastConnectedDevice = async () => {
        const lastDeviceId = await AsyncStorage.getItem('lastConnectedDevice');
        if (!lastDeviceId) return;

        try {
            // Check if device is already connected in system
            const connectedDevices = await manager.connectedDevices([]);
            let device = connectedDevices.find(d => d.id === lastDeviceId);

            if (!device) {
                // Attempt to connect
                device = await manager.connectToDevice(lastDeviceId);
            }

            await device.discoverAllServicesAndCharacteristics();
            setConnectedDevice(device);

            if (Platform.OS === 'android') {
                try { await device.requestMTU(512); } catch(e) {}
            }

            const services = await device.services();
            for (const service of services) {
                const characteristics = await service.characteristics();
                const writeChar = characteristics.find(c => c.isWritableWithoutResponse) || characteristics.find(c => c.isWritableWithResponse);
                if (writeChar) { setWritableChar(writeChar); break; }
            }
        } catch(e) {
            console.log("Restoration failed, removing stored ID");
            AsyncStorage.removeItem('lastConnectedDevice');
        }
    };

    // ------------------- SCAN -------------------
    const startScan = () => {
        if (scanning) return;

        setDevicesMap({});
        setScanning(true);

        manager.startDeviceScan(null, { allowDuplicates: false }, (error, device) => {
            if (error) {
                // If error is regarding location/bluetooth off, stop scanning
                console.log("Scan Error:", error);
                stopScan();
                if (error.reason !== 'Device is not powered on') {
                    setModalMessage('Failed to scan devices');
                    setIsSuccess(false);
                    setModalVisible(true);
                }
                return;
            }

            if (device && device.name && device.name.trim() !== "") {
                setDevicesMap(prev => ({ ...prev, [device.id]: device }));
            }
        });
    };

    const stopScan = () => {
        manager.stopDeviceScan();
        setScanning(false);
        setLoading(false);
    };

    const printTest = async () => {
        if (!connectedDevice || !writableChar) {
            setModalMessage('Please connect to a printer first');
            setIsSuccess(false);
            setModalVisible(true);
            return;
        }
        try {
            setLoading(true);
            const textBytes = Buffer.from('\n\n\nConnected! Print test 123\n\n\n\n\n\n\n', 'utf-8');
            await sendInChunks(textBytes, connectedDevice, writableChar, currentMTU);
            setModalMessage('Test sent to printer!');
            setIsSuccess(true);
            setModalVisible(true);
        } catch(e: any) {
            setModalMessage(`Print Error: ${e.message || 'Unknown error'}`);
            setIsSuccess(false);
            setModalVisible(true);
            // If write fails, connection might be dead
            await disconnectDevice();
        } finally {
            setLoading(false);
        }
    };

    const handleBluetoothToggle = async (value: boolean) => {
        setBluetoothEnabled(value);
        await AsyncStorage.setItem('bluetoothEnabled', JSON.stringify(value));
        if (!value) {
            stopScan();
            if (connectedDevice) {
                await disconnectDevice();
            }
        } else {
            startScan();
        }
    };

    const rssiToBars = (rssi?: number) => {
        if (rssi === undefined || rssi === null) return 0;
        if (rssi >= -50) return 4;
        if (rssi >= -60) return 3;
        if (rssi >= -70) return 2;
        if (rssi >= -80) return 1;
        return 0;
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
                    }}/>
                ))}
            </View>
        );
    };

    const renderDevice = ({ item }: { item: Device }) => {
        const isConnected = connectedDevice?.id === item.id;
        // Use type assertion carefully or optional chaining
        const rssi = (item as any).rssi as number | undefined;

        return (
            <Pressable
                android_ripple={{ color: colors.border }}
                style={[
                    styles.deviceRow,
                    isConnected && { backgroundColor: colors.card },
                    (loading || isConnected) && { opacity: 0.6 }
                ]}
                onPress={() => !loading && !isConnected && connectToDevice(item)}
                disabled={loading || isConnected}
            >
                <View style={styles.leftCol}>
                    <View style={[styles.deviceIcon, { backgroundColor: colors.card }]}>
                        <Text style={FONTS.fontMedium}>🖨️</Text>
                    </View>
                    <View style={{ marginLeft: 12, flex: 1 }}>
                        <Text style={[FONTS.fontMedium, { color: COLORS.light }]} numberOfLines={1}>
                            {item.name || 'Unknown Device'}
                        </Text>
                        <Text style={[FONTS.fontXs, { color: colors.text, fontWeight: '500' }]} numberOfLines={1}>
                            {item.id}
                        </Text>
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

    return (
        <View style={{ flex:1, backgroundColor: colors.background }}>

            <View style={[styles.headerSection, { backgroundColor: COLORS.primary }]}>
                <View>
                    <Text style={[FONTS.h2, { color: COLORS.title }]}>Printer</Text>
                    <Text style={[FONTS.fontMedium]}>{!bluetoothEnabled
                        ? 'Bluetooth off'
                        : connectedDevice
                            ? 'Connected'
                            : 'Available devices'}</Text>
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
                        <View style={[styles.quickRow, { backgroundColor: colors.card }]}>
                            <View>
                                <Text style={[FONTS.fontMedium, { color: colors.text }]}>Paired devices</Text>
                                <Text style={[FONTS.fontXs, { color: colors.text }]}>
                                    {Object.values(devicesMap).filter(d => connectedDevice?.id === d.id).length} connected
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
                    }
                    ListEmptyComponent={() => (
                        !scanning && bluetoothEnabled ? (
                            <Text style={[FONTS.fontMedium, { textAlign: 'center', marginTop: 40, color: colors.text }]}>
                                No devices found
                            </Text>
                        ) : null
                    )}
                />
            )}

            {bluetoothEnabled && connectedDevice && (
                <View style={{ position: 'absolute', left: 0, right: 0, bottom: 0, backgroundColor: colors.card, padding: 16, borderTopWidth: 1, borderTopColor: colors.border }}>
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
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

            {/* Fixed precedence here: (A || B) && C */}
            {(connecting || disconnecting) && (
                <View pointerEvents="auto" style={{ position:'absolute', top:0,left:0,right:0,bottom:0, backgroundColor:'rgba(0,0,0,0.2)', justifyContent:'center', alignItems:'center', zIndex:999 }}>
                    <ActivityIndicator size="large" color={COLORS.primary} />
                    <Text style={[FONTS.h6, { color: COLORS.light, marginTop:12 }]}>
                        {connecting ? "Connecting..." : "Disconnecting..."}
                    </Text>
                </View>
            )}
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