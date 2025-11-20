import { Buffer } from "buffer";

interface ReceiptItem {
    label: string;
    amount: number;
    draw: string;
    win: number;
}

export interface ReceiptProps {
  header: string;
  appName: string;
  officialText: string;
  betTime: string;
  items: ReceiptItem[];
  qrData?: string;
}

// ESC/POS QR
export const escPosQR = (data: string) => {
  const GS = "\x1D";
  let qr = "";
  qr += GS + "(k" + String.fromCharCode(4,0,49,65,50,0);
  qr += GS + "(k" + String.fromCharCode(3,0,49,67,1);
  qr += GS + "(k" + String.fromCharCode(3,0,49,69,48);

  const len = data.length + 3;
  const pL = len % 256;
  const pH = Math.floor(len / 256);
  qr += GS + "(k" + String.fromCharCode(pL,pH,49,80,48) + data;
  qr += GS + "(k" + String.fromCharCode(3,0,49,81,48);

  return qr;
};

// Generate receipt text
export const generateReceiptText = ({
                                        header,
                                        appName,
                                        officialText,
                                        betTime,
                                        items,
                                    }: ReceiptProps): Buffer => {
    const ESC = "\x1B";
    const CENTER = ESC + "a" + "\x01";
    const LEFT   = ESC + "a" + "\x00";

    let receipt = "";
    receipt += ESC + "@"; // initialize

    // Center header - medium, bold
    receipt += CENTER;
    receipt += ESC + "E" + "\x01";        // bold on
    receipt += ESC + "!" + "\x08";        // double height
    receipt += header + "\n";
    receipt += ESC + "E" + "\x00";        // bold off

    // Center app name - small, normal
    receipt += CENTER;
    receipt += ESC + "E" + "\x00";        // bold off
    receipt += ESC + "!" + "\x00";        // normal font size
    receipt += appName + "\n";

    // Center official text - medium, bold
    receipt += CENTER;
    receipt += ESC + "E" + "\x01";        // bold on
    receipt += ESC + "!" + "\x08";        // double height
    receipt += officialText + "\n\n";
    receipt += ESC + "E" + "\x00";        // bold off

    // Back to left
    receipt += LEFT;
    receipt += ESC + "!" + "\x00";
    receipt += "Bet Time: " + betTime + "\n";

    receipt += LEFT + "\n";
    receipt += LEFT + "Bet      Amt      Draw    Win\n";
    receipt += LEFT + "-".repeat(32) + "\n";

    // Table rows
    items.forEach(item => {
        // Adjust padding to match header
        const label = item.label.padEnd(9, ' ');
        const amount = ("P" + item.amount).padStart(2, ' ');
        const draw = item.draw.padStart(10, ' ');
        const win = ("P" + item.win).padStart(8, ' ');

        receipt += LEFT + `${label}${amount}${draw}${win}\n`;
    });

    // Total
    const total = items.reduce((sum, i) => sum + i.amount, 0);
    receipt += LEFT + "-".repeat(32) + "\n";
    receipt += LEFT + `Total: P${total.toFixed(2)}\n\n`;

    return Buffer.from(receipt, "utf-8");
};

// Split buffer into chunks (default 512 bytes)
export const splitChunks = (buffer: Buffer, chunkSize = 512): Buffer[] => {
  const chunks: Buffer[] = [];
  for (let i = 0; i < buffer.length; i += chunkSize) {
    chunks.push(buffer.slice(i, i + chunkSize));
  }
  return chunks;
};

// Convert base64 image to ESC/POS image data
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