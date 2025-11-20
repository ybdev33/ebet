import { Device, Characteristic } from 'react-native-ble-plx';
import { Buffer } from 'buffer';
import { splitChunks } from '../printer/ReceiptPrinter';

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export const sendInChunks = async (
    buffer: Buffer,
    connectedDevice: Device,
    writableChar: Characteristic,
    currentMTU: number
) => {
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