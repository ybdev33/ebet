import { useState } from "react";
import { BleManager, Device, Characteristic } from "react-native-ble-plx";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Platform } from "react-native";
import { sendInChunks } from "./printerUtils";

export function usePrinter() {
    const [manager] = useState(new BleManager());
    const [connectedDevice, setConnectedDevice] = useState<Device | null>(null);
    const [writableChar, setWritableChar] = useState<Characteristic | null>(null);
    const [mtu, setMtu] = useState(23);

    const connectLastPrinter = async () => {
        const lastId = await AsyncStorage.getItem("lastConnectedDevice");
        if (!lastId) throw new Error("No saved printer");

        const device = await manager.connectToDevice(lastId);
        await device.discoverAllServicesAndCharacteristics();
        setConnectedDevice(device);

        if (Platform.OS === "android") {
            try {
                const dev = await device.requestMTU(512);
                setMtu(dev.mtu);
            } catch (e) {}
        }

        const services = await device.services();
        for (const s of services) {
            const chars = await s.characteristics();
            const writeChar =
                chars.find(c => c.isWritableWithoutResponse) ||
                chars.find(c => c.isWritableWithResponse);

            if (writeChar) {
                setWritableChar(writeChar);
                break;
            }
        }
    };

    const printBuffer = async (buffer: Buffer) => {
        if (!connectedDevice || !writableChar)
            throw new Error("Printer not ready");

        await sendInChunks(buffer, connectedDevice, writableChar, mtu);
    };

    const isConnected = async (): Promise<boolean> => {
        if (!connectedDevice) return false;
        try {
            return await connectedDevice.isConnected();
        } catch (e) {
            return false;
        }
    };

    return {
        connectLastPrinter,
        printBuffer,
        connectedDevice,
        writableChar,
        mtu,
        isConnected,
    };
}
