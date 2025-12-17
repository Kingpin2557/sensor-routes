import { SerialPort } from "serialport";

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

const isArduinoPort = (portInfo) => {
    const manufacturer = portInfo.manufacturer?.toLowerCase() ?? "";
    const matchesManufacturer = manufacturer.includes(ARDUINO_MANUFACTURER_KEYWORD.toLowerCase());
    const matchesVendorId = portInfo.vendorId === ARDUINO_VENDOR_ID;
    return matchesManufacturer || matchesVendorId;
};

let cachedPort = null;

export async function getPort() {
    if (cachedPort) return cachedPort;

    // Vercel/serverless: geen serial devices + udevadm ontbreekt
    if (process.env.VERCEL) {
        return null;
    }

    const ports = await SerialPort.list(); // kan lokaal wel werken
    logConnectedSerialDevices(ports);

    const arduinoPortInfo = ports.find(isArduinoPort);
    if (!arduinoPortInfo) {
        throw new Error("No Arduino detected!");
    }

    cachedPort = new SerialPort({
        path: arduinoPortInfo.path,
        baudRate: DEFAULT_BAUD_RATE,
    });

    return cachedPort;
}