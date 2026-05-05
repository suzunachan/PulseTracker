const { SerialPort } = require('serialport');
const { ReadlineParser } = require('@serialport/parser-readline');
const { WebSocketServer } = require('ws');

const PORT_PATH = 'COM3';   // ← change to your Arduino's COM port
const BAUD_RATE = 115200;   // ← match your Arduino sketch

const serial = new SerialPort({ path: PORT_PATH, baudRate: BAUD_RATE });
const parser = serial.pipe(new ReadlineParser({ delimiter: '\n' }));
const wss    = new WebSocketServer({ port: 8080 });

// Listen to Arduino data OUTSIDE the connection event
parser.on('data', (line) => {
  try {
    JSON.parse(line); // validate it's JSON
    console.log('Arduino:', line.trim()); // so you can see data in terminal
    wss.clients.forEach((client) => {
      if (client.readyState === 1) {
        client.send(line.trim());
      }
    });
  } catch {
    console.log('Non-JSON from Arduino:', line.trim());
  }
});

wss.on('connection', (ws) => {
  console.log('Browser connected');
});

console.log('Bridge running on ws://localhost:8080');