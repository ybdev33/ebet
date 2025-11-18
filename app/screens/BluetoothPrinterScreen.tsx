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
import { BleManager, Device, Characteristic } from "react-native-ble-plx";
import { Buffer } from "buffer";

export default function BLEPrinterScreen() {
  const [manager] = useState(new BleManager());
  const [devices, setDevices] = useState<Device[]>([]);
  const [connectedDevice, setConnectedDevice] = useState<Device | null>(null);
  const [writableChar, setWritableChar] = useState<Characteristic | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    requestPermissions();
    return () => manager.destroy();
  }, []);

  const requestPermissions = async () => {
    if (Platform.OS === "android") {
      await PermissionsAndroid.requestMultiple([
        PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
        PermissionsAndroid.PERMISSIONS.BLUETOOTH_SCAN,
        PermissionsAndroid.PERMISSIONS.BLUETOOTH_CONNECT,
      ]);
    }
  };

  const scanDevices = () => {
    setLoading(true);
    setDevices([]);

    manager.startDeviceScan(null, null, (error, device) => {
      if (error) {
        Alert.alert("Scan Error", error.message);
        setLoading(false);
        return;
      }
      if (device) {
        setDevices((prev) => {
          if (
            !prev.find(
              (d) => d.id + (d.name || "") === device.id + (device.name || "")
            )
          ) {
            return [...prev, device];
          }
          return prev;
        });
      }
    });

    setTimeout(() => {
      manager.stopDeviceScan();
      setLoading(false);
    }, 10000);
  };

  const connectToDevice = async (device: Device) => {
    try {
      setLoading(true);
      const connected = await device.connect();
      await connected.discoverAllServicesAndCharacteristics();
      setConnectedDevice(connected);

      // Automatically find writable characteristic
      const services = await connected.services();
      for (const service of services) {
        const characteristics = await service.characteristics();
        const writeChar = characteristics.find(
          (c) => c.isWritableWithResponse || c.isWritableWithoutResponse
        );
        if (writeChar) {
          setWritableChar(writeChar);
          break;
        }
      }

      if (!writableChar) {
        Alert.alert("Error", "No writable characteristic found!");
      }

      Alert.alert("Connected", `Connected to ${device.name || device.id}`);
    } catch (e: any) {
      Alert.alert("Connection Error", e.message);
    } finally {
      setLoading(false);
    }
  };

  const disconnectDevice = async () => {
    if (!connectedDevice) return;
    try {
      await connectedDevice.cancelConnection();
      setConnectedDevice(null);
      setWritableChar(null);
    } catch (e: any) {
      Alert.alert("Disconnect Error", e.message);
    }
  };

  // Helper: send data in 20-byte chunks
  const sendInChunks = async (data: string) => {
    if (!connectedDevice || !writableChar) return;
    const buffer = Buffer.from(data, "utf-8");
    const chunkSize = 20;
    for (let i = 0; i < buffer.length; i += chunkSize) {
      const slice = buffer.slice(i, i + chunkSize);
      const base64 = slice.toString("base64");
      await connectedDevice.writeCharacteristicWithResponseForService(
        writableChar.serviceUUID,
        writableChar.uuid,
        base64
      );
    }
  };

  // Print ESC/POS receipt
  const printTestReceipt = async () => {
    if (!connectedDevice || !writableChar) {
      return Alert.alert("Error", "Connect to a printer first!");
    }

    try {
      const ESC = "\x1B";
      const GS = "\x1D";

      let receipt = "";
      receipt += ESC + "!" + "\x38"; // Bold + double height/width
      receipt += "EBET GAME\n";
      receipt += ESC + "!" + "\x00"; // Normal
      receipt += "123 Main St.\n";
      receipt += "Tel: 123-456-7890\n";
      receipt += "-----------------------------\n";

      const items = [
        { name: "Coffee", qty: 1, price: 4.5 },
        { name: "Croissant", qty: 2, price: 6 },
      ];

      items.forEach((item) => {
        const line = `${item.name.padEnd(15)}${item.qty} x ${item.price}\n`;
        receipt += line;
      });

      receipt += "-----------------------------\n";
      const total = items.reduce((sum, i) => sum + i.qty * i.price, 0);
      receipt += `TOTAL: ${total.toFixed(2)}\n`;
      receipt += "\n\n\n"; // Feed paper

      await sendInChunks(receipt);
      Alert.alert("Printed", "Receipt sent to printer!");
    } catch (e: any) {
      Alert.alert("Print Error", e.message || "Unknown error occurred");
    }
  };

  const renderDevice = ({ item }: { item: Device }) => (
    <TouchableOpacity
      style={styles.deviceCard}
      onPress={() => connectToDevice(item)}
    >
      <Text style={styles.deviceName}>{item.name || "Unknown Device"}</Text>
      <Text style={styles.deviceId}>{item.id}</Text>
      <Text style={styles.tapToConnect}>Tap to connect</Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.header}>BLE Printers</Text>

      <TouchableOpacity style={styles.scanBtn} onPress={scanDevices}>
        <Text style={styles.scanText}>🔍 Scan for BLE Devices</Text>
      </TouchableOpacity>

      {loading && (
        <ActivityIndicator size="large" style={{ marginVertical: 20 }} />
      )}

      <FlatList
        data={devices}
        keyExtractor={(item, index) => item.id + (item.name || "") + index}
        renderItem={renderDevice}
        ListEmptyComponent={
          !loading && <Text style={styles.noDevice}>No devices found</Text>
        }
      />

      {connectedDevice && (
        <View style={styles.bottomPanel}>
          <Text style={styles.connectedLabel}>
            Connected: {connectedDevice.name || connectedDevice.id}
          </Text>

          <TouchableOpacity style={styles.printBtn} onPress={printTestReceipt}>
            <Text style={styles.printText}>🖨️ Print Test Receipt</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.disconnectBtn}
            onPress={disconnectDevice}
          >
            <Text style={styles.disconnectText}>Disconnect</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f4f6fa", padding: 15 },
  header: {
    fontSize: 24,
    fontWeight: "700",
    marginVertical: 10,
    color: "#222",
  },
  scanBtn: {
    backgroundColor: "#3b82f6",
    padding: 15,
    borderRadius: 12,
    alignItems: "center",
    marginVertical: 10,
  },
  scanText: { fontSize: 16, color: "#fff", fontWeight: "600" },
  deviceCard: {
    backgroundColor: "#fff",
    padding: 15,
    borderRadius: 12,
    marginVertical: 6,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  deviceName: { fontSize: 18, fontWeight: "600" },
  deviceId: { fontSize: 14, color: "#666" },
  tapToConnect: { marginTop: 5, fontSize: 14, color: "#3b82f6" },
  noDevice: { textAlign: "center", marginTop: 40, color: "#777" },
  bottomPanel: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    padding: 20,
    backgroundColor: "#fff",
    borderTopWidth: 1,
    borderColor: "#ddd",
  },
  connectedLabel: { fontSize: 16, fontWeight: "600", marginBottom: 10 },
  printBtn: {
    backgroundColor: "#10b981",
    padding: 15,
    borderRadius: 12,
    marginBottom: 10,
    alignItems: "center",
  },
  printText: { color: "#fff", fontWeight: "700", fontSize: 16 },
  disconnectBtn: {
    backgroundColor: "#ef4444",
    padding: 15,
    borderRadius: 12,
    alignItems: "center",
  },
  disconnectText: { color: "#fff", fontWeight: "700", fontSize: 16 },
});
