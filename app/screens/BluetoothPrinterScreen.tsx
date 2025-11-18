import React, { useEffect, useState } from "react";
import {
    View,
    Text,
    TouchableOpacity,
    FlatList,
    ActivityIndicator,
    PermissionsAndroid,
    Platform,
    StyleSheet,
} from "react-native";
import { ESCPosPrinter } from "react-native-esc-pos-printer";

export default function BluetoothPrinterScreen() {
    const [devices, setDevices] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const [connected, setConnected] = useState<any>(null);

    useEffect(() => {
        requestPermissions();
    }, []);

    const requestPermissions = async () => {
        if (Platform.OS === "android") {
            await PermissionsAndroid.requestMultiple([
                PermissionsAndroid.PERMISSIONS.BLUETOOTH_SCAN,
                PermissionsAndroid.PERMISSIONS.BLUETOOTH_CONNECT,
                PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
            ]);
        }
    };

    const scanDevices = async () => {
        setLoading(true);
        try {
            const list = await ESCPosPrinter.scanBluetooth();
            setDevices(list);
        } catch (e) {
            console.log("Scan Error:", e);
        }
        setLoading(false);
    };

    const connectPrinter = async (device: any) => {
        try {
            const result = await ESCPosPrinter.connectBluetooth(device.macAddress);
            if (result) {
                setConnected(device);
                alert(`Connected to ${device.name}`);
            }
        } catch (err) {
            alert("Connection failed");
            console.log(err);
        }
    };

    const printTest = async () => {
        if (!connected) return alert("No printer connected.");

        try {
            await ESCPosPrinter.printBluetooth({
                commands: [
                    { type: "text", value: "HELLO WORLD\n" },
                    { type: "text", value: "ESC/POS Modern Printer Test\n" },
                    { type: "text", value: "------------------------------\n" },
                    { type: "qr", value: "https://google.com", size: 8 },
                ],
            });

            alert("Printed successfully!");
        } catch (err) {
            console.log("Print error:", err);
        }
    };

    const disconnectPrinter = async () => {
        try {
            await ESCPosPrinter.disconnectBluetooth();
            setConnected(null);
            alert("Disconnected");
        } catch (e) {
            console.log("Disconnect error:", e);
        }
    };

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Bluetooth ESC/POS Printer</Text>

            <TouchableOpacity style={styles.button} onPress={scanDevices}>
                <Text style={styles.buttonText}>Scan Printers</Text>
            </TouchableOpacity>

            {loading && <ActivityIndicator size="large" style={{ margin: 10 }} />}

            <FlatList
                data={devices}
                keyExtractor={(item) => item.macAddress}
                renderItem={({ item }) => (
                    <TouchableOpacity
                        style={styles.deviceItem}
                        onPress={() => connectPrinter(item)}
                    >
                        <Text style={styles.deviceName}>{item.name || "Unknown"}</Text>
                        <Text style={styles.deviceMac}>{item.macAddress}</Text>
                    </TouchableOpacity>
                )}
            />

            {connected && (
                <>
                    <Text style={styles.connectedText}>
                        Connected: {connected.name}
                    </Text>

                    <TouchableOpacity style={styles.printBtn} onPress={printTest}>
                        <Text style={styles.buttonText}>Print Test</Text>
                    </TouchableOpacity>

                    <TouchableOpacity style={styles.disconnectBtn} onPress={disconnectPrinter}>
                        <Text style={styles.buttonText}>Disconnect</Text>
                    </TouchableOpacity>
                </>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, padding: 20, backgroundColor: "#fff" },
    title: { fontSize: 22, fontWeight: "bold", marginBottom: 20 },
    button: {
        backgroundColor: "#007aff",
        padding: 12,
        borderRadius: 8,
        marginBottom: 15,
    },
    printBtn: {
        backgroundColor: "green",
        padding: 12,
        borderRadius: 8,
        marginTop: 15,
    },
    disconnectBtn: {
        backgroundColor: "red",
        padding: 12,
        borderRadius: 8,
        marginTop: 10,
    },
    buttonText: { color: "white", textAlign: "center", fontWeight: "600" },
    deviceItem: {
        padding: 12,
        borderWidth: 1,
        borderColor: "#ccc",
        borderRadius: 8,
        marginBottom: 10,
    },
    deviceName: { fontWeight: "bold", fontSize: 16 },
    deviceMac: { color: "gray" },
    connectedText: { marginTop: 15, fontSize: 16, fontWeight: "bold" },
});
