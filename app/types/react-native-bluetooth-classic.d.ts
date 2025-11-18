declare module 'react-native-bluetooth-classic' {
    export interface BluetoothDevice {
        name?: string;
        address: string;
    }

    const BluetoothClassic: {
        connect(address: string): Promise<boolean>;
        disconnect(): Promise<void>;
        write(message: string): Promise<void>;
        getBondedDevices(): Promise<BluetoothDevice[]>;
        startDiscovery(): Promise<void>;
        cancelDiscovery(): Promise<void>;
        onDeviceDiscovered(callback: (device: BluetoothDevice) => void): { remove(): void };
    };

    export { BluetoothDevice };
    export default BluetoothClassic;
}
