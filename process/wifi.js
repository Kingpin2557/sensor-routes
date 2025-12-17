import express from "express";
import { SerialPort } from "serialport";
import * as path from "node:path";

const app = express();
app.use(express.json());

const PUBLIC_DIR = path.resolve(process.cwd(), 'public');

// Serve static files (including index.html) from the public directory
app.use(express.static(PUBLIC_DIR));

const ARDUINO_VENDOR_ID = "303A";
const ARDUINO_MANUFACTURER_KEYWORD = "Microsoft";
const DEFAULT_BAUD_RATE = 9600;

function logConnectedSerialDevices(ports) {
    if (!ports.length) {
        console.log("Geen seriële apparaten gevonden.");
        return;
    }

    console.log("Gevonden seriële apparaten:");
    for (const p of ports) {
        console.log(
            `- path=${p.path}, manufacturer=${p.manufacturer ?? "onbekend"}, vendorId=${p.vendorId ?? "onbekend"}, productId=${p.productId ?? "onbekend"}`
        );
    }
}

const ports = await SerialPort.list();
logConnectedSerialDevices(ports);

const isArduinoPort = (portInfo) => {
    const manufacturer = portInfo.manufacturer?.toLowerCase() ?? "";
    const matchesManufacturer = manufacturer.includes(ARDUINO_MANUFACTURER_KEYWORD);
    const matchesVendorId = portInfo.vendorId === ARDUINO_VENDOR_ID;
    return matchesManufacturer || matchesVendorId;
};

const arduinoPortInfo = ports.find(isArduinoPort);

if (!arduinoPortInfo) {
    console.error("No Arduino detected!");
    process.exit(1);
}

export const port = new SerialPort({
    path: arduinoPortInfo.path,
    baudRate: DEFAULT_BAUD_RATE,
});