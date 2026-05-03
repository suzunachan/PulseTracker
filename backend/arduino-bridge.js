// arduino-bridge.js
// Run this locally: node arduino-bridge.js

const { SerialPort } = require('serialport');
const { ReadlineParser } = require('@serialport/parser-readline');
const WebSocket = require('ws');

// ⚠️ Change to your Arduino port
// Windows: 'COM3' or 'COM4' etc — check Device Manager
// Mac/Linux: '/dev/ttyUSB0' or '/dev/ttyACM0'
const ARDUINO_PORT = 'COM3';

const port = new SerialPort({ path: ARDUINO_PORT, baudRate: 115200 });
const parser = port.pipe(new ReadlineParser({ delimiter: '\n' }));

const wss = new WebSocket.Server({ port: 8080 });
console.log('WebSocket bridge running on ws://localhost:8080');

port.on('open', () => console.log('Arduino connected on ' + ARDUINO_PORT));
port.on('error', (err) => console.error('Serial error:', err.message));

parser.on('data', (line) => {
  try {
    // Only forward valid JSON lines (skip "IR=..." debug lines)
    if (!line.trim().startsWith('{')) return;

    const data = JSON.parse(line);

    wss.clients.forEach(client => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(JSON.stringify(data));
      }
    });
  } catch (e) {}
});