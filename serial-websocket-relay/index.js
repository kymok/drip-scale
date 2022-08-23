import { ArgumentParser } from "argparse";
import { WebSocketServer } from "ws";
import { SerialPort, ReadlineParser } from "serialport";

const argparser = new ArgumentParser({
    description: "Drip Scale USB serial/WebSocket Adapter"
})
argparser.add_argument("--port", {default: 8000})
argparser.add_argument("--serial", {required: true})
argparser.add_argument("--verbose", {action: "store_true"})
const args = argparser.parse_args()


// Listeners
const listeners = {}
let id = 0

const addSerialListener = (func) => {
    id++
    listeners[id] = func
    return id
}

const removeSerialListener = (id) => {
    delete listeners[id]
}

const broadcastToSerialListeners = (data) => {
    Object.values(listeners).map(
        e => e(data)
    )
}


// Open Serial Port and add parsers

const loadCellSerialDataParser = (data) => {
    const [sensorId, reading] = data.split(":")
    return {
        timestamp: Date.now(),
        sensorId,
        reading: parseInt(reading),
    }
}

const serialPortPath = args.serial
const serialPort = new SerialPort(
    {
        path: serialPortPath,
        baudRate: 115200
    }
)
console.log(`Serial port ${serialPortPath} opened`)
const parser = serialPort.pipe(new ReadlineParser({ delimiter: "\r\n" }))
parser.on("data", (data) => {
    const parsedData = loadCellSerialDataParser(data)
    broadcastToSerialListeners(parsedData)
})

if (args.verbose) {
    addSerialListener(console.log)
}


// WebSocket Handling

const webSocketPort = args.port
const wss = new WebSocketServer({
    port: webSocketPort
}, () => {
    console.log(`Server running at port ${webSocketPort}`)
})

wss.on("connection", (ws, req) => {
    const addr = req.socket.remoteAddress;
    ws.on("message", (message) => {
        console.log(`Received ${message}`)
    })

    console.log(`Hello, ${addr}`)
    const id = addSerialListener((message) => ws.send(JSON.stringify(message)))

    ws.on("close", () => {
        removeSerialListener(id)
        console.log(`Bye, ${addr}`)
    })
})