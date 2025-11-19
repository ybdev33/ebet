import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
  Alert,
  StyleSheet,
  Platform,
  PermissionsAndroid,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { BleManager, Device, Characteristic } from "react-native-ble-plx";
import { Buffer } from "buffer";
import { generateReceiptText, splitChunks, escPosQR } from "../printer/ReceiptPrinter";
import { logoBase64 } from "../../assets/logoBase64";

global.Buffer = global.Buffer || Buffer;

// Helper to sleep (prevents overflowing printer buffer)
const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

// ... (Keep escposImageFromBase64RN same as your code) ...
export function escposImageFromBase64RN(base64: string, width = 384): Buffer {
  const bytes = Buffer.from(base64, "base64");
  const rowBytes = width / 8;
  const height = Math.floor(bytes.length / rowBytes);
  const header = Buffer.from([
    0x1d, 0x76, 0x30, 0x00,
    rowBytes & 0xff,
    (rowBytes >> 8) & 0xff,
    height & 0xff,
    (height >> 8) & 0xff,
  ]);
  return Buffer.concat([header, bytes]);
}

export default function BLEPrinterScreen() {
  const [manager] = useState(new BleManager());
  const [devicesMap, setDevicesMap] = useState<{ [key: string]: Device }>({});
  const [connectedDevice, setConnectedDevice] = useState<Device | null>(null);
  const [writableChar, setWritableChar] = useState<Characteristic | null>(null);
  const [scanning, setScanning] = useState(false);
  const [loading, setLoading] = useState(false);

  // Store the negotiated MTU size
  const [currentMTU, setCurrentMTU] = useState<number>(23);

  useEffect(() => {
    requestPermissions().then(() => restoreLastConnectedDevice());
    return () => manager.destroy();
  }, []);

  // ... (Keep requestPermissions same) ...

  const requestPermissions = async () => {
    if (Platform.OS === "android") {
      await PermissionsAndroid.requestMultiple([
        PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
        PermissionsAndroid.PERMISSIONS.BLUETOOTH_SCAN,
        PermissionsAndroid.PERMISSIONS.BLUETOOTH_CONNECT,
      ]);
    }
  };

  // ----------------- Connect Logic (Optimized) -----------------
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
      Alert.alert("Connection Error", e.message);
    } finally {
      setLoading(false);
    }
  };

  // ... (Keep disconnectDevice same) ...
  const disconnectDevice = async () => {
    if (!connectedDevice) return;
    try {
      await connectedDevice.cancelConnection();
    } catch (e: any) {
      Alert.alert("Disconnect Error", e.message);
    } finally {
      setConnectedDevice(null);
      setWritableChar(null);
      AsyncStorage.removeItem("lastConnectedDevice");
    }
  };

  // ... (Keep restoreLastConnectedDevice - make sure it calls connectToDevice logic) ...
  const restoreLastConnectedDevice = async () => {
    const lastDeviceId = await AsyncStorage.getItem("lastConnectedDevice");
    if (!lastDeviceId) return;
    // We can't just use manager.connectToDevice directly if we want to reuse the logic
    // It's better to find it or just create a shell object if you know the ID
    // For simplicity in this snippet, we will just attempt connection:
    try {
        // Note: We need a Device object to call connect(), logic simplified here:
        const device = await manager.connectToDevice(lastDeviceId);
        // Call the rest of the setup logic manually or refactor connectToDevice
        await device.discoverAllServicesAndCharacteristics();
        setConnectedDevice(device);

        // Setup MTU and Char similar to connectToDevice...
        if(Platform.OS === 'android') {
            try { await device.requestMTU(512); } catch(e){}
        }

        const services = await device.services();
        for (const service of services) {
             const characteristics = await service.characteristics();
             const writeChar = characteristics.find((c) => c.isWritableWithoutResponse)
                            || characteristics.find((c) => c.isWritableWithResponse);
             if(writeChar) { setWritableChar(writeChar); break; }
        }
    } catch (e) {
        AsyncStorage.removeItem("lastConnectedDevice");
    }
  };

  // ----------------- Send in chunks (Heavily Optimized) -----------------
  const sendInChunks = async (buffer: Buffer) => {
    if (!connectedDevice || !writableChar) return;

    // 3. OPTIMIZATION: Calculate chunk size based on MTU
    // We subtract 3 bytes for BLE headers.
    // If MTU is 512, we send ~509 bytes. If MTU is 23, we send 20.
    const maxChunk = currentMTU > 23 ? currentMTU - 3 : 20;

    const chunks = splitChunks(buffer, maxChunk);

    for (let i = 0; i < chunks.length; i++) {
      const chunkBase64 = chunks[i].toString("base64");

      if (writableChar.isWritableWithoutResponse) {
        // FAST MODE: Fire and forget
        await connectedDevice.writeCharacteristicWithoutResponseForService(
          writableChar.serviceUUID,
          writableChar.uuid,
          chunkBase64
        );

        // 4. OPTIMIZATION: Flow Control
        // If we send too fast, the printer's internal buffer (4KB-128KB) fills up
        // and it starts printing garbage or stops.
        // We pause for 10ms every 5 chunks to let the printer process.
        if (i % 5 === 0) {
            await sleep(10);
        }
      } else {
        // SLOW MODE: Wait for ACK (Fallback)
        await connectedDevice.writeCharacteristicWithResponseForService(
          writableChar.serviceUUID,
          writableChar.uuid,
          chunkBase64
        );
      }
    }
  };

  // ... (Keep scan logic and printReceipt logic same) ...

  // Just ensure scan logic is here for the full file context
  const startScan = () => {
    if (scanning) return;
    setScanning(true);
    setDevicesMap({});
    manager.startDeviceScan(null, null, (error, device) => {
      if (error) {
        Alert.alert("Scan Error", error.message);
        stopScan();
        return;
      }
      if (!device?.id) return;
      setDevicesMap(prev => ({ ...prev, [device.id]: device }));
    });
  };

  const stopScan = () => {
    manager.stopDeviceScan();
    setScanning(false);
    setLoading(false);
  };

  // ... (Render methods same as before) ...

  const printReceipt = async () => {
    if (!connectedDevice || !writableChar) return Alert.alert("Error", "Connect to a printer first!");
    try {
      setLoading(true);

      const imageBytes = escposImageFromBase64RN(logoBase64, 384);

      const receiptText = generateReceiptText({
        storeName: "eBet Game",
        storeAddress: "123 Main St",
        storeTel: "123-456-7890",
        items: [
          { name: "2S2", qty: 2, price: 1.5 },
          { name: "2S3", qty: 3, price: 0.75 },
        ],
      });
      const receiptTextBytes = Buffer.isBuffer(receiptText) ? receiptText : Buffer.from(receiptText, "utf-8");
      const qrBytes = Buffer.from(escPosQR("https://example.com"), "utf-8");

      // Add 3 lines of padding at the end so the cutter doesn't cut the text
      const footerBytes = Buffer.from("\n\n\n", "utf-8");

      const fullBuffer = Buffer.concat([imageBytes, receiptTextBytes, qrBytes, footerBytes]);

      await sendInChunks(fullBuffer);

    //   Alert.alert("Printed", "Receipt sent to printer!");
    } catch (e: any) {
      console.log("Print Error", e.message || e);
      Alert.alert("Print Error", e.message || "Unknown error");
    } finally {
      setLoading(false);
    }
  };

  const renderDevice = ({ item }: { item: Device }) => {
    const isConnected = connectedDevice?.id === item.id;
    return (
      <TouchableOpacity
        style={[styles.deviceCard, isConnected && { borderColor: "#10b981", borderWidth: 2, backgroundColor: "#d1fae5" }]}
        onPress={() => connectToDevice(item)}
      >
        <Text style={[styles.deviceName, isConnected && { color: "#065f46" }]}>{item.name || "Unknown Device"}</Text>
        <Text style={styles.deviceId}>{item.id}</Text>
        <Text style={[styles.tapToConnect, isConnected && { color: "#065f46" }]}>{isConnected ? "Connected" : "Tap to connect"}</Text>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Available Printers</Text>
      <View style={{ flexDirection: "row", marginVertical: 10 }}>
        <TouchableOpacity style={[styles.scanBtn, { flex: 1, marginRight: 5 }]} onPress={startScan} disabled={scanning}>
          {scanning ? <ActivityIndicator color="#fff" /> : <Text style={styles.scanText}>🔍 Scan</Text>}
        </TouchableOpacity>
        <TouchableOpacity style={[styles.disconnectBtn, { flex: 1, marginLeft: 5, backgroundColor: scanning ? "#000" : "#aaa" }]} onPress={stopScan} disabled={!scanning}>
          <Text style={styles.disconnectText}>Stop Scan</Text>
        </TouchableOpacity>
      </View>
      <FlatList
        data={Object.values(devicesMap)}
        keyExtractor={(item) => item.id}
        renderItem={renderDevice}
        contentContainerStyle={{ paddingBottom: 180 }}
        ListEmptyComponent={!loading && <Text style={styles.noDevice}>No devices found</Text>}
      />
      {connectedDevice && (
        <View style={styles.bottomPanel}>
          <Text style={styles.connectedLabel}>Connected: {connectedDevice.name || connectedDevice.id}</Text>
          <TouchableOpacity style={styles.printBtn} onPress={printReceipt}>
            {loading ? <ActivityIndicator color="#fff"/> : <Text style={styles.printText}>🖨️ Print Receipt</Text>}
          </TouchableOpacity>
          <TouchableOpacity style={styles.disconnectBtn} onPress={disconnectDevice}>
            <Text style={styles.disconnectText}>Disconnect</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}

// ... (Styles same as before) ...
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f4f6fa", padding: 15 },
  header: { fontSize: 24, fontWeight: "700", marginVertical: 10, color: "#222" },
  scanBtn: { backgroundColor: "#3b82f6", padding: 15, borderRadius: 12, alignItems: "center" },
  scanText: { fontSize: 16, color: "#fff", fontWeight: "600" },
  deviceCard: { backgroundColor: "#fff", padding: 15, borderRadius: 12, marginVertical: 6, shadowColor: "#000", shadowOpacity: 0.1, shadowRadius: 4 },
  deviceName: { fontSize: 18, fontWeight: "600" },
  deviceId: { fontSize: 14, color: "#666" },
  tapToConnect: { marginTop: 5, fontSize: 14, color: "#3b82f6" },
  noDevice: { textAlign: "center", marginTop: 40, color: "#777" },
  bottomPanel: { position: "absolute", left: 0, right: 0, bottom: 0, padding: 20, backgroundColor: "#fff", borderTopWidth: 1, borderColor: "#ddd" },
  connectedLabel: { color: "#10b981", fontSize: 18, fontWeight: "600", marginBottom: 10 },
  printBtn: { backgroundColor: "#10b981", padding: 15, borderRadius: 12, marginBottom: 10, alignItems: "center" },
  printText: { color: "#fff", fontWeight: "700", fontSize: 16 },
  disconnectBtn: { backgroundColor: "#ef4444", padding: 15, borderRadius: 12, alignItems: "center" },
  disconnectText: { color: "#fff", fontWeight: "700", fontSize: 16 },
});