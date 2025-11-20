import { Buffer } from "buffer";

export type ReceiptItem = { name: string; qty: number; price: number };

export interface ReceiptProps {
  storeName: string;
  storeAddress: string;
  storeTel: string;
  items: ReceiptItem[];
  qrData?: string;
}

// ESC/POS QR
export const escPosQR = (data: string) => {
  const GS = "\x1D";
  let qr = "";
  qr += GS + "(k" + String.fromCharCode(4,0,49,65,50,0);
  qr += GS + "(k" + String.fromCharCode(3,0,49,67,6);
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
  storeName,
  storeAddress,
  storeTel,
  items,
}: ReceiptProps): Buffer => {
  const ESC = "\x1B";
  let receipt = "";
  receipt += ESC + "@"; // initialize

  // Store header
  receipt += ESC + "!" + "\x25";
  receipt += storeName + "\n";
  receipt += ESC + "!" + "\x00";

  receipt += storeAddress + "\nTel: " + storeTel + "\n";
  receipt += "-----------------------------\n";
  receipt += "Item           QTY  Price\n";
  receipt += "-----------------------------\n";

  items.forEach(item => {
    const name = item.name.length > 15 ? item.name.slice(0,15) : item.name.padEnd(15," ");
    const qty = String(item.qty).padEnd(3," ");
    const price = item.price.toFixed(2).padStart(6," ");
    receipt += `${name}${qty} x${price}\n`;
  });

  receipt += "-----------------------------\n";
  const total = items.reduce((sum,i) => sum + i.qty * i.price, 0);
  receipt += `TOTAL: ${total.toFixed(2)}\n\n`;

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